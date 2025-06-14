import ModalExample from "@src/components/modals/commanModal";

const Placeholder = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const routeParams = await params;

  if (routeParams.slug === "modal") {
    return <ModalExample />;
  }

  return (
    <div>
      <h1>Coming Soon: {routeParams?.slug}</h1>
      <p>This page is under development.</p>
    </div>
  );
};

export default Placeholder;
