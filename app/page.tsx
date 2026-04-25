import { ElimuCoreHome } from "@/components/home/elimu-core-home";
import { getHomepageData } from "@/lib/resources";

export const revalidate = 3600;

export default async function HomePage() {
  const homePageData = await getHomepageData();

  return <ElimuCoreHome {...homePageData} />;
}
