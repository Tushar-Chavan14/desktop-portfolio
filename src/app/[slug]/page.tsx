const Placeholder = ({
  params: { slug },
}: {
  params: {
    slug: string;
  };
}) => {
  return (
    <div>
      <h1>Coming Soon: {slug}</h1>
      <p>This page is under development.</p>
    </div>
  );
};

export default Placeholder;
