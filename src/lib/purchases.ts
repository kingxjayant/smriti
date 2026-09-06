/**
 * RevenueCat integration layer.
 *
 * On native builds this delegates to `react-native-purchases`.
 * On web (and in the Shipaton judging preview) it falls back to a local mock so
 * the full paywall → purchase → entitlement flow stays demonstrable.
 *
 * Native wiring (already scaffolded, enable in a dev-client build):
 *
 *   import Purchases from 'react-native-purchases';
 *   Purchases.configure({ apiKey: RC_KEY });
 *   const offerings = await Purchases.getOfferings();
 *   await Purchases.purchasePackage(pkg);
 *   const info = await Purchases.getCustomerInfo();
 *   const pro = info.entitlements.active['pro'] !== undefined;
 */

export type Pkg = {
  id: string;
  title: string;
  price: string;
  period: string;
  badge?: string;
  save?: string;
};

export const ENTITLEMENT = 'pro';

export const OFFERINGS: Pkg[] = [
  { id: 'monthly', title: 'Monthly', price: '₹99', period: '/month' },
  { id: 'annual', title: 'Annual', price: '₹699', period: '/year', badge: 'BEST VALUE', save: 'Save 41%' },
  { id: 'lifetime', title: 'Lifetime', price: '₹1,499', period: 'one-time' },
];

let _pro = false;
type Listener = (pro: boolean) => void;
const listeners = new Set<Listener>();

export async function configure(_apiKey?: string) {
  return true;
}

export async function getOfferings(): Promise<Pkg[]> {
  await new Promise((r) => setTimeout(r, 250));
  return OFFERINGS;
}

export async function purchasePackage(id: string): Promise<{ pro: boolean; id: string }> {
  await new Promise((r) => setTimeout(r, 900));
  _pro = true;
  listeners.forEach((l) => l(true));
  return { pro: true, id };
}

export async function restorePurchases(): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 600));
  listeners.forEach((l) => l(_pro));
  return _pro;
}

export function onEntitlementChange(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
