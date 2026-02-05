import WebsiteSetupSidebar from "@/components/shared/website-setup-sidebar";

interface Props {
  children: React.ReactNode;
}

const WebsiteSetupLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <div className="lg:w-[270px]">
        <WebsiteSetupSidebar />
      </div>

      <div className="lg:w-[calc(100%_-_270px)]">
        <div className="bg-white rounded-xl p-5">{children}</div>
      </div>
    </div>
  );
};

export default WebsiteSetupLayout;
