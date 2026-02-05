import PageForm from "@/components/forms/website-setup/pages/page-form";
import { getPage } from "@/lib/api/website-pages";
import { notFound } from "next/navigation";

const Page = async ({ params: { id } }: { params: { id: string } }) => {
  let page = null;
  if (id !== "add") page = await getPage(id);

  // Validate the page
  if (page === false) return notFound();
  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">{id === "add" ? "Add" : "Edit"} Page</h3>
        <p className="text-black/50 text-sm font-medium">
          Enter your page details below.
        </p>
      </div>

      <PageForm data={page} isEdit={page && true} />
    </div>
  );
};

export default Page;
