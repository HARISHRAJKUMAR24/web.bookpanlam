// app/dashboard/all-plans/page.tsx
import { getPlans } from "@/lib/api/plans";
import UpgradePlans from "@/components/upgrade/Plans";
import { cookies } from 'next/headers'; // Use Next.js cookies

export default async function PlansPage() {
  const plansData = await getPlans();
  
  // Get user ID from cookies (adjust cookie name based on your setup)
  const cookieStore = cookies();
  const userId = cookieStore.get('user_id')?.value || 
                 cookieStore.get('userId')?.value || 
                 cookieStore.get('uid')?.value || 
                 null;

  return (
    <UpgradePlans 
      initialPlans={plansData.data} 
      initialCurrencySettings={plansData.currency_settings}
      userId={userId}
    />
  );
}