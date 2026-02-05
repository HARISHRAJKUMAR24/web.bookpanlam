interface Props {
  children: React.ReactNode;
}

const Sticky = ({ children }: Props) => {
  return (
    <>
      <div className="bg-white border-t h-16 fixed bottom-0 w-[calc(100%_-_70px)] 2xl:w-[calc(100%_-_270px)] left-[70px] 2xl:left-[270px] flex items-center justify-end 2xl:px-8 px-5">
        {children}
      </div>

      <style jsx global>{`
        .mainWrapper {
          padding-bottom: 64px !important;
        }
      `}</style>
    </>
  );
};

export default Sticky;
