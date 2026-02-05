import Checkout from "@/components/forms/checkout/checkout";
import { getPlans } from "@/lib/api/plans";
import { currentUser } from "@/lib/api/auth";

export default async function PlanPage({ searchParams }: { searchParams: { plan_id?: string } }) {
  const planId = searchParams?.plan_id;

  if (!planId) {
    return <div className="p-10 text-center text-red-600">Missing plan_id</div>;
  }

  // Get logged-in user 🔥
  const user = await currentUser();
  //console.log("🔥 USER FROM PAGE:", user);

  if (!user) {
    return <div className="p-10 text-center text-red-600">User not logged in</div>;
  }

  // Get all plans
  const response = await getPlans();
  const plans = response?.success ? response.data : [];

  // Find selected plan
  const selectedPlan = plans.find((p: any) => Number(p.id) === Number(planId));

  if (!selectedPlan) {
    return <div className="p-10 text-center text-red-600">Plan not found</div>;
  }

  return (
    <Checkout 
      plan={selectedPlan}
      gst={response.gst_settings}
      currencySettings={response.currency_settings}
      companySettings={response.company_settings}

      // 🔥 THIS WAS MISSING
      user={user}
    />
  );
}
