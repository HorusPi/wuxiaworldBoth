import { Center, Container, Title } from "@mantine/core";
import { dehydrate, QueryClient } from "react-query";
import Sections from "../components/common/Sections";
import { novelsFetch, useNovels } from "../components/hooks/useNovels";
import dynamic from "next/dynamic";
import BackgroundLoading from "../components/Background/BackgroundLoading";
import Seo from "../components/common/Seo";
import { initializeStore, useStore } from "../components/Store/Store";
import TopBox from "../components/common/TopBox";
import { useEffect } from "react";

const RecentlyUpdated = dynamic(
  () => import("../components/common/RecentlyUpdated.js"),
  { ssr: false, loading: () => <BackgroundLoading /> }
);

export async function getStaticProps() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["home_view"], novelsFetch, {
    staleTime: Infinity,
  });
  const zustandStore = initializeStore();

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      initialZustandState: JSON.parse(JSON.stringify(zustandStore.getState())),
    },
    revalidate: 60 * 60 * 3,
  };
}

export default function HomePage({ dehydratedState }) {
  const { data } = useNovels();
  const siteName = useStore((state) => state.siteName);
  const siteUrl = useStore((state) => state.siteUrl);
  const axiosRun = useStore((state) => state.axiosRun);

  useEffect(() => {
    if (typeof window !== "undefined") {
      axiosRun();
    }
  }, []);
  return (
    <>
      <Seo
        description={`${siteName} has the latest translations of your favorite Chinese, Japanese, Korean - Light Novels and Web Novels. All Chapters Are Updated Daily and New Novels Added Very Frequently.`}
        url={`${siteUrl}`}
        title={`${siteName} - Read Chinese, Korean and Japanese Novels`}
        image={""}
        loading={false}
      />
      <Container sx={{ marginTop: "20px" }}>
        <TopBox />
      </Container>
      <Container>
        {data?.map((category: any) => (
          <Sections
            categoryName={category.name}
            novelList={category.novels}
            categorySlug={category.slug}
            key={category.slug}
          />
        ))}

        <RecentlyUpdated tag={null} category={null} />
      </Container>
    </>
  );
}
