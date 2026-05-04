import "server-only";
import { createHash, randomInt } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServiceRoleKey } from "@/lib/supabase/env";
import { sendMail } from "@/lib/mailer";

type PasswordResetProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type PasswordResetUser = {
  id: string;
  email: string;
  fullName: string;
};

type PasswordResetOtpRow = {
  id: string;
  user_id: string;
  email: string;
  otp_hash: string;
  attempts: number;
  expires_at: string;
  used_at: string | null;
};

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

function getPasswordResetSecret() {
  return (
    process.env.PASSWORD_RESET_OTP_SECRET?.trim() ||
    getSupabaseServiceRoleKey().trim()
  );
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function createOtpHash(args: { userId: string; email: string; otp: string }) {
  return createHash("sha256")
    .update(
      `${getPasswordResetSecret()}:${args.userId}:${normalizeEmail(args.email)}:${args.otp}`
    )
    .digest("hex");
}

function generateOtp() {
  return randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
}

function buildResetEmail(args: { fullName: string; otp: string }) {
  const greeting = args.fullName.trim() || "ELimuCore member";
  const subject = "Your ELimuCore password reset code";
  const text = [
    `Hello ${greeting},`,
    "",
    `Your ELimuCore password reset code is ${args.otp}.`,
    `This code expires in ${OTP_TTL_MINUTES} minutes.`,
    "",
    "If you did not request this code, you can ignore this email."
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #e2e8f0;">
        <p style="margin:0 0 12px;font-size:15px;color:#334155;">Hello ${greeting},</p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
          Use this code to reset your ELimuCore password.
        </p>
        <div style="margin:0 0 18px;padding:18px 20px;border-radius:16px;background:#f0fdf4;border:1px solid #bbf7d0;text-align:center;">
          <span style="font-size:32px;letter-spacing:0.3em;font-weight:700;color:#166534;">${args.otp}</span>
        </div>
        <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#475569;">
          This code expires in ${OTP_TTL_MINUTES} minutes.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
          If you did not request this code, you can ignore this email.
        </p>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html
  };
}

async function getProfileById(id: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", id)
    .maybeSingle();

  return (data ?? null) as PasswordResetProfileRow | null;
}

async function getRegisteredUserByEmail(email: string) {
  const supabase = createAdminClient();
  const normalizedEmail = normalizeEmail(email);
  const perPage = 200;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    });

    if (error) {
      throw new Error("We could not check that account right now.");
    }

    const users = data?.users ?? [];
    const authUser = users.find(
      (user) => normalizeEmail(user.email ?? "") === normalizedEmail
    );

    if (authUser?.id && authUser.email) {
      const profile = await getProfileById(authUser.id);

      return {
        id: authUser.id,
        email: authUser.email,
        fullName:
          profile?.full_name?.trim() ||
          String(authUser.user_metadata?.full_name ?? "").trim() ||
          authUser.email
      } satisfies PasswordResetUser;
    }

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function startPasswordReset(email: string) {
  const registeredUser = await getRegisteredUserByEmail(email);

  if (!registeredUser?.id || !registeredUser.email) {
    return { dispatched: false as const };
  }

  const supabase = createAdminClient();
  const otp = generateOtp();
  const otpHash = createOtpHash({
    userId: registeredUser.id,
    email: registeredUser.email,
    otp
  });
  const expiresAt = new Date(
    Date.now() + OTP_TTL_MINUTES * 60 * 1000
  ).toISOString();
  const otpTable = (supabase as any).from("password_reset_otps");

  await otpTable.delete().eq("user_id", registeredUser.id).is("used_at", null);

  const { error: insertError } = await otpTable.insert({
    user_id: registeredUser.id,
    email: registeredUser.email,
    otp_hash: otpHash,
    expires_at: expiresAt
  });

  if (insertError) {
    throw new Error("We could not prepare your reset code right now.");
  }

  const message = buildResetEmail({
    fullName: registeredUser.fullName,
    otp
  });

  try {
    await sendMail({
      to: registeredUser.email,
      subject: message.subject,
      text: message.text,
      html: message.html
    });
  } catch (error) {
    await otpTable
      .delete()
      .eq("user_id", registeredUser.id)
      .eq("otp_hash", otpHash);

    throw error instanceof Error
      ? error
      : new Error("We could not send the reset email right now.");
  }

  return {
    dispatched: true as const,
    email: registeredUser.email
  };
}

export async function resetPasswordWithOtp(args: {
  email: string;
  otp: string;
  password: string;
}) {
  const registeredUser = await getRegisteredUserByEmail(args.email);

  if (!registeredUser?.id || !registeredUser.email) {
    return {
      success: false as const,
      message: "That code is not valid. Request a new one and try again."
    };
  }

  const supabase = createAdminClient();
  const otpTable = (supabase as any).from("password_reset_otps");
  const { data } = await otpTable
    .select("id, user_id, email, otp_hash, attempts, expires_at, used_at")
    .eq("user_id", registeredUser.id)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const record = (data ?? null) as PasswordResetOtpRow | null;

  if (!record) {
    return {
      success: false as const,
      message: "That code is not valid. Request a new one and try again."
    };
  }

  const nowIso = new Date().toISOString();
  const expired = Date.parse(record.expires_at) <= Date.now();

  if (expired) {
    await otpTable.update({ used_at: nowIso }).eq("id", record.id);
    return {
      success: false as const,
      message: "That code has expired. Request a new one and try again."
    };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await otpTable.update({ used_at: nowIso }).eq("id", record.id);
    return {
      success: false as const,
      message: "Too many code attempts. Request a fresh code and try again."
    };
  }

  const expectedHash = createOtpHash({
    userId: registeredUser.id,
    email: registeredUser.email,
    otp: args.otp.trim()
  });

  if (expectedHash !== record.otp_hash) {
    const nextAttempts = record.attempts + 1;
    await otpTable
      .update({
        attempts: nextAttempts,
        used_at: nextAttempts >= MAX_OTP_ATTEMPTS ? nowIso : null
      })
      .eq("id", record.id);

    return {
      success: false as const,
      message: "That code is not correct. Check it and try again."
    };
  }

  const { error: updateUserError } = await supabase.auth.admin.updateUserById(
    registeredUser.id,
    {
      password: args.password
    }
  );

  if (updateUserError) {
    throw new Error("We could not update your password right now.");
  }

  await otpTable
    .update({ used_at: nowIso })
    .eq("user_id", registeredUser.id)
    .is("used_at", null);

  return {
    success: true as const,
    message: "Your password has been updated. Login to continue."
  };
}
