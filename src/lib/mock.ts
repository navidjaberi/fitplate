import type { Analysis, Locale } from "./schema";

type Meal = Record<Locale, Analysis>;

const MEALS: Meal[] = [
  {
    en: {
      isFood: true,
      dishName: "Grilled chicken with rice and salad",
      confidence: "high",
      notes: "Assumes about one tablespoon of oil used for grilling.",
      items: [
        { name: "Grilled chicken breast", portion: "1 fillet", grams: 150, calories: 248, protein: 46.5, carbs: 0, fat: 5.4 },
        { name: "White rice", portion: "1 cup", grams: 180, calories: 234, protein: 4.8, carbs: 51, fat: 0.5 },
        { name: "Green salad", portion: "1 bowl", grams: 120, calories: 35, protein: 1.6, carbs: 6.5, fat: 0.3 },
        { name: "Olive oil dressing", portion: "1 tbsp", grams: 14, calories: 119, protein: 0, carbs: 0, fat: 13.5 },
      ],
    },
    fa: {
      isFood: true,
      dishName: "مرغ کبابی با برنج و سالاد",
      confidence: "high",
      notes: "حدود یک قاشق غذاخوری روغن برای کباب کردن در نظر گرفته شده.",
      items: [
        { name: "سینه مرغ کبابی", portion: "۱ تکه", grams: 150, calories: 248, protein: 46.5, carbs: 0, fat: 5.4 },
        { name: "برنج سفید", portion: "۱ پیمانه", grams: 180, calories: 234, protein: 4.8, carbs: 51, fat: 0.5 },
        { name: "سالاد سبز", portion: "۱ کاسه", grams: 120, calories: 35, protein: 1.6, carbs: 6.5, fat: 0.3 },
        { name: "سس روغن زیتون", portion: "۱ قاشق غذاخوری", grams: 14, calories: 119, protein: 0, carbs: 0, fat: 13.5 },
      ],
    },
  },
  {
    en: {
      isFood: true,
      dishName: "Margherita pizza",
      confidence: "medium",
      notes: "Crust thickness is hard to judge from the photo.",
      items: [
        { name: "Margherita pizza", portion: "2 slices", grams: 210, calories: 532, protein: 22.8, carbs: 66, fat: 19.4 },
        { name: "Cola", portion: "1 can", grams: 330, calories: 139, protein: 0, carbs: 35, fat: 0 },
      ],
    },
    fa: {
      isFood: true,
      dishName: "پیتزا مارگاریتا",
      confidence: "medium",
      notes: "ضخامت خمیر از روی عکس دقیق مشخص نیست.",
      items: [
        { name: "پیتزا مارگاریتا", portion: "۲ برش", grams: 210, calories: 532, protein: 22.8, carbs: 66, fat: 19.4 },
        { name: "نوشابه", portion: "۱ قوطی", grams: 330, calories: 139, protein: 0, carbs: 35, fat: 0 },
      ],
    },
  },
  {
    en: {
      isFood: true,
      dishName: "Yogurt bowl with fruit and granola",
      confidence: "high",
      notes: "Assumes plain full-fat yogurt and a drizzle of honey.",
      items: [
        { name: "Greek yogurt", portion: "1 cup", grams: 200, calories: 194, protein: 18, carbs: 8, fat: 10 },
        { name: "Granola", portion: "1/3 cup", grams: 40, calories: 180, protein: 4, carbs: 26, fat: 7 },
        { name: "Mixed berries", portion: "1/2 cup", grams: 75, calories: 38, protein: 0.5, carbs: 9, fat: 0.2 },
        { name: "Honey", portion: "1 tsp", grams: 7, calories: 21, protein: 0, carbs: 5.8, fat: 0 },
      ],
    },
    fa: {
      isFood: true,
      dishName: "کاسه ماست با میوه و گرانولا",
      confidence: "high",
      notes: "ماست ساده پرچرب و کمی عسل در نظر گرفته شده.",
      items: [
        { name: "ماست یونانی", portion: "۱ پیمانه", grams: 200, calories: 194, protein: 18, carbs: 8, fat: 10 },
        { name: "گرانولا", portion: "⅓ پیمانه", grams: 40, calories: 180, protein: 4, carbs: 26, fat: 7 },
        { name: "توت‌های مخلوط", portion: "½ پیمانه", grams: 75, calories: 38, protein: 0.5, carbs: 9, fat: 0.2 },
        { name: "عسل", portion: "۱ قاشق چای‌خوری", grams: 7, calories: 21, protein: 0, carbs: 5.8, fat: 0 },
      ],
    },
  },
  {
    en: {
      isFood: true,
      dishName: "Chelo kabab koobideh",
      confidence: "medium",
      notes: "Includes the butter usually served on the rice.",
      items: [
        { name: "Kabab koobideh", portion: "2 skewers", grams: 200, calories: 520, protein: 34, carbs: 4, fat: 41 },
        { name: "Saffron rice", portion: "1.5 cups", grams: 270, calories: 351, protein: 7, carbs: 77, fat: 0.8 },
        { name: "Butter", portion: "1 tbsp", grams: 14, calories: 100, protein: 0.1, carbs: 0, fat: 11.3 },
        { name: "Grilled tomato", portion: "1 piece", grams: 120, calories: 22, protein: 1, carbs: 4.7, fat: 0.2 },
      ],
    },
    fa: {
      isFood: true,
      dishName: "چلوکباب کوبیده",
      confidence: "medium",
      notes: "کره‌ای که معمولاً روی برنج سرو می‌شه هم حساب شده.",
      items: [
        { name: "کباب کوبیده", portion: "۲ سیخ", grams: 200, calories: 520, protein: 34, carbs: 4, fat: 41 },
        { name: "برنج زعفرانی", portion: "۱.۵ پیمانه", grams: 270, calories: 351, protein: 7, carbs: 77, fat: 0.8 },
        { name: "کره", portion: "۱ قاشق غذاخوری", grams: 14, calories: 100, protein: 0.1, carbs: 0, fat: 11.3 },
        { name: "گوجه کبابی", portion: "۱ عدد", grams: 120, calories: 22, protein: 1, carbs: 4.7, fat: 0.2 },
      ],
    },
  },
];

export function mockAnalysis(image: string, locale: Locale): Analysis {
  let hash = 0;
  for (let i = 0; i < image.length; i += 97) hash = (hash * 31 + image.charCodeAt(i)) >>> 0;
  return MEALS[hash % MEALS.length][locale];
}
