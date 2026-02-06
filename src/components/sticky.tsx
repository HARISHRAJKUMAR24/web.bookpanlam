interface Props {
  children: React.ReactNode;
}

const Sticky = ({ children }: Props) => {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0
  bg-white
  border-t border-gray-300
  shadow-[0_-4px_12px_rgba(0,0,0,0.08)]
  px-4 sm:px-8 py-4
  flex justify-end">
        {children}
      </div>

      <style jsx global>{`
        .mainWrapper {
          padding-bottom: 80px !important;
        }
      `}</style>
    </>
  );
};

export default Sticky;
