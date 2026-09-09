/**
 * Seeds demo data for Korea Mart Jos.
 *
 * These are DEMO products/prices for sales-demo purposes only — replace
 * with the business's real inventory before going live (see README).
 *
 * Usage: npm run seed
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { config } from "dotenv";
import { resolve } from "path";

// Plain `dotenv/config` only auto-loads a file literally named `.env`.
// Next.js's `.env.local` convention isn't something dotenv knows about by
// default, so this script (run outside of Next via tsx) has to be told
// explicitly where to look.
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
}

async function main() {
  console.log("Seeding categories...");
  const categoriesData = [
    { name: "Ramen & Noodles", description: "Instant and fresh Korean noodles" },
    { name: "Snacks", description: "Korean chips, biscuits and sweets" },
    { name: "Drinks", description: "Korean sodas, teas and juices" },
    { name: "Sauces & Condiments", description: "Gochujang, soy sauce and more" },
    { name: "Korean Ingredients", description: "Pantry staples for Korean cooking" },
    { name: "Frozen Foods", description: "Frozen dumplings, rice cakes and more" },
    { name: "Seaweed", description: "Roasted and seasoned seaweed snacks" },
    { name: "Instant Foods", description: "Quick Korean meals and sides" },
    { name: "Other Asian Groceries", description: "Japanese, Chinese and other Asian favorites" },
  ];

  const categoryRows: any[] = [];
  for (let i = 0; i < categoriesData.length; i++) {
    const c = categoriesData[i];
    const { data, error } = await supabase
      .from("categories")
      .upsert({ ...c, slug: slugify(c.name), sort_order: i }, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw error;
    categoryRows.push(data);
  }
  const catId = (name: string) => categoryRows.find((c) => c.name === name)!.id;

  console.log("Seeding products...");
  const products = [
    { name: "Shin Ramyun", category: "Ramen & Noodles", price: 1500, featured: true, new: false, desc: "Spicy Korean instant noodles, a household favorite." },
    { name: "Buldak Carbonara", category: "Ramen & Noodles", price: 1800, featured: true, new: true, desc: "Creamy, spicy fire noodles with a carbonara twist." },
    { name: "Buldak Original Hot Chicken", category: "Ramen & Noodles", price: 1700, featured: true, new: false, desc: "The original extremely spicy fire noodles." },
    { name: "Jin Ramen Mild", category: "Ramen & Noodles", price: 1400, featured: false, new: false, desc: "Mild, savory Korean instant noodles." },
    { name: "Neoguri Spicy Seafood Noodles", category: "Ramen & Noodles", price: 1600, featured: false, new: true, desc: "Thick udon-style noodles with spicy seafood broth." },
    { name: "Pepero Original", category: "Snacks", price: 1200, featured: true, new: false, desc: "Chocolate-covered biscuit sticks." },
    { name: "Pepero Almond", category: "Snacks", price: 1300, featured: false, new: false, desc: "Pepero sticks topped with crushed almonds." },
    { name: "Honey Butter Chips", category: "Snacks", price: 2000, featured: true, new: true, desc: "Sweet and savory potato chips, a Korean classic." },
    { name: "Choco Pie (Box of 12)", category: "Snacks", price: 3500, featured: false, new: false, desc: "Soft marshmallow-filled chocolate cakes." },
    { name: "Ottogi Yakisoba Snack", category: "Snacks", price: 900, featured: false, new: false, desc: "Crunchy yakisoba-flavored snack sticks." },
    { name: "Milkis Soda", category: "Drinks", price: 1000, featured: false, new: false, desc: "Milky, creamy Korean soft drink." },
    { name: "Korean Sikhye (Sweet Rice Drink)", category: "Drinks", price: 1200, featured: false, new: true, desc: "Traditional sweet fermented rice beverage." },
    { name: "Aloe Vera Juice Drink", category: "Drinks", price: 1100, featured: false, new: false, desc: "Refreshing juice with real aloe vera pulp." },
    { name: "Sujeonggwa Cinnamon Punch", category: "Drinks", price: 1300, featured: false, new: false, desc: "Traditional Korean cinnamon-persimmon punch." },
    { name: "Gochujang (Korean Chili Paste)", category: "Sauces & Condiments", price: 4500, featured: true, new: false, desc: "Fermented Korean red chili paste, essential for many dishes." },
    { name: "Korean BBQ Sauce (Bulgogi Sauce)", category: "Sauces & Condiments", price: 3800, featured: true, new: false, desc: "Sweet and savory marinade for bulgogi and grilling." },
    { name: "Doenjang (Soybean Paste)", category: "Sauces & Condiments", price: 4200, featured: false, new: false, desc: "Fermented soybean paste for soups and stews." },
    { name: "Korean Soy Sauce", category: "Sauces & Condiments", price: 2800, featured: false, new: false, desc: "All-purpose Korean soy sauce." },
    { name: "Sesame Oil", category: "Korean Ingredients", price: 3200, featured: false, new: false, desc: "Toasted sesame oil for authentic Korean flavor." },
    { name: "Rice Cakes (Tteok) for Tteokbokki", category: "Korean Ingredients", price: 2500, featured: true, new: true, desc: "Chewy rice cakes, perfect for tteokbokki." },
    { name: "Korean Short Grain Rice (2kg)", category: "Korean Ingredients", price: 6500, featured: false, new: false, desc: "Premium short-grain rice for Korean cooking." },
    { name: "Gochugaru (Korean Chili Flakes)", category: "Korean Ingredients", price: 3900, featured: false, new: false, desc: "Coarse Korean red chili flakes." },
    { name: "Frozen Mandu (Korean Dumplings)", category: "Frozen Foods", price: 3500, featured: true, new: false, desc: "Pork and vegetable dumplings, ready to steam or fry." },
    { name: "Frozen Kimchi Mandu", category: "Frozen Foods", price: 3700, featured: false, new: true, desc: "Spicy kimchi-filled dumplings." },
    { name: "Frozen Tteokbokki Rice Cakes", category: "Frozen Foods", price: 2200, featured: false, new: false, desc: "Ready-to-cook rice cakes for tteokbokki." },
    { name: "Roasted Seaweed Snack (Gim)", category: "Seaweed", price: 1500, featured: true, new: false, desc: "Crispy, lightly salted roasted seaweed sheets." },
    { name: "Wasabi Seaweed Snack", category: "Seaweed", price: 1600, featured: false, new: true, desc: "Roasted seaweed with a spicy wasabi kick." },
    { name: "Instant Tteokbokki Kit", category: "Instant Foods", price: 3200, featured: true, new: false, desc: "Everything you need for spicy rice cakes at home." },
    { name: "Instant Japchae Kit", category: "Instant Foods", price: 3400, featured: false, new: false, desc: "Sweet potato glass noodle stir-fry kit." },
    { name: "Pocky Matcha (Japan)", category: "Other Asian Groceries", price: 1800, featured: false, new: false, desc: "Green tea flavored biscuit sticks." },
  ];

  for (const p of products) {
    const { error } = await supabase.from("products").upsert(
      {
        name: p.name,
        slug: slugify(p.name),
        description: p.desc,
        price: p.price,
        category_id: catId(p.category),
        image_url: null,
        in_stock: true,
        is_featured: p.featured,
        is_new_arrival: p.new,
        is_active: true,
      },
      { onConflict: "slug" }
    );
    if (error) throw error;
  }

  console.log("Seeding Eat & Cook experience + sessions...");
  const { data: experience, error: expError } = await supabase
    .from("experiences")
    .upsert(
      {
        name: "Eat & Cook",
        slug: "eat-cook",
        description:
          "Pick your favourite Korean noodles, cook them your way, and enjoy them right here at Korea Mart Jos.",
        default_price: 5000,
        default_duration_minutes: 90,
        default_capacity: 8,
        is_active: true,
        is_featured: true,
        what_included: [
          "Your choice of Korean ramen or noodles",
          "Cooking station and utensils",
          "Seating to enjoy your meal on-site",
        ],
        what_to_know: [
          "Please arrive 10 minutes before your session",
          "Sessions typically last 60–90 minutes",
          "Let us know about any allergies in advance",
        ],
      },
      { onConflict: "slug" }
    )
    .select()
    .single();
  if (expError) throw expError;

  const today = new Date();
  const sessionsToCreate = [];
  for (let d = 1; d <= 10; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    sessionsToCreate.push(
      { experience_id: experience.id, session_date: dateStr, start_time: "16:00:00", end_time: "17:30:00", capacity: 8, price: 5000 },
      { experience_id: experience.id, session_date: dateStr, start_time: "18:00:00", end_time: "19:30:00", capacity: 8, price: 5000 }
    );
  }
  const { error: sessionsError } = await supabase.from("experience_sessions").insert(sessionsToCreate);
  if (sessionsError) console.warn("Sessions insert warning (may already exist):", sessionsError.message);

  console.log("Seeding activities...");
  const activityDate1 = new Date(today);
  activityDate1.setDate(activityDate1.getDate() + 5);
  const activityDate2 = new Date(today);
  activityDate2.setDate(activityDate2.getDate() + 8);
  const activityDate3 = new Date(today);
  activityDate3.setDate(activityDate3.getDate() + 12);

  const activities = [
    {
      title: "Korean Cooking Class: Kimchi 101",
      description: "Learn to make traditional kimchi from scratch with our hands-on class.",
      price: 12000,
      event_date: activityDate1.toISOString().slice(0, 10),
      start_time: "15:00:00",
      end_time: "17:00:00",
      capacity: 10,
      location: "Korea Mart Jos — main hall",
      what_included: ["All ingredients", "Recipe card to take home", "Jar of kimchi to take home"],
      requirements: ["Please wear closed-toe shoes"],
      is_featured: true,
    },
    {
      title: "Ramen Night",
      description: "A fun evening of ramen tasting, games, and good company.",
      price: 8000,
      event_date: activityDate2.toISOString().slice(0, 10),
      start_time: "18:00:00",
      end_time: "20:00:00",
      capacity: 15,
      location: "Korea Mart Jos",
      what_included: ["3 ramen tastings", "One drink"],
      requirements: [],
      is_featured: true,
    },
    {
      title: "K-Drama Night & Snack Tasting",
      description: "Watch clips from popular K-dramas while sampling Korean snacks.",
      price: 5000,
      event_date: activityDate3.toISOString().slice(0, 10),
      start_time: "17:00:00",
      end_time: "19:00:00",
      capacity: 20,
      location: "Korea Mart Jos",
      what_included: ["Snack tasting platter", "Drink"],
      requirements: [],
      is_featured: false,
    },
  ];

  for (const a of activities) {
    const { error } = await supabase.from("activities").upsert(
      { ...a, slug: slugify(a.title), status: "open", is_active: true },
      { onConflict: "slug" }
    );
    if (error) throw error;
  }

  console.log("Seeding a sample promotion...");
  const { data: existingPromo } = await supabase
    .from("promotions")
    .select("id")
    .eq("title", "Weekend Ramen Special")
    .maybeSingle();
  if (!existingPromo) {
    await supabase.from("promotions").insert({
      title: "Weekend Ramen Special",
      description: "10% off all ramen and noodles, every Saturday and Sunday.",
      discount_text: "10% OFF",
      is_active: true,
    });
  }

  console.log("✅ Seed complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
