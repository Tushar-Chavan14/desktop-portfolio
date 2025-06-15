import { TextEditorWidowModalExp } from "@src/components/modals/windows/textEditorWindow";

const Placeholder = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const routeParams = await params;

  if (routeParams?.slug === "window") {
    return <TextEditorWidowModalExp />;
  }

  return (
    <div>
      <h1>Coming Soon: {routeParams?.slug}</h1>
      <p>This page is under development.</p>
    </div>
  );
};

export default Placeholder;
