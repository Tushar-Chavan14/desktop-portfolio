const Placeholder = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const routeParams = await params;

  return (
    <div>
      <h1>Coming Soon: {routeParams?.slug}</h1>
      <p>This page is under development.</p>
    </div>
  );
};

export default Placeholder;
