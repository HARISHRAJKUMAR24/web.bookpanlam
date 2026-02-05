import { formatNumber } from "@/lib/utils";
import { ReportOverviewCardProps } from "@/types";

const OverviewCard = ({ index, label, number }: ReportOverviewCardProps) => {
  let bg_color = "bg-primary/10";
  let text_color = "text-primary";
  let border_color = "border-primary";

  switch (index) {
    case 0:
      bg_color = "bg-lime-500/10";
      text_color = "text-lime-500";
      border_color = "border-lime-500";
      break;

    case 1:
      bg_color = "bg-blue-500/10";
      text_color = "text-blue-500";
      border_color = "border-blue-500";
      break;

    case 2:
      bg_color = "bg-orange-500/10";
      text_color = "text-orange-500";
      border_color = "border-orange-500";
      break;

    case 3:
      bg_color = "bg-green-500/10";
      text_color = "text-green-500";
      border_color = "border-green-500";
      break;

    case 4:
      bg_color = "bg-yellow-500/10";
      text_color = "text-yellow-500";
      border_color = "border-yellow-500";
      break;

    case 5:
      bg_color = "bg-indigo-500/10";
      text_color = "text-indigo-500";
      border_color = "border-indigo-500";
      break;

    case 6:
      bg_color = "bg-red-500/10";
      text_color = "text-red-500";
      border_color = "border-red-500";
      break;
  }

  return (
    <div className={`${bg_color} ${border_color} border rounded-lg py-4 px-6`}>
      <p className="font-medium">{label}</p>

      <p className={`${text_color} font-bold text-4xl mt-2`}>
        {formatNumber(number)}
      </p>
    </div>
  );
};

export default OverviewCard;
