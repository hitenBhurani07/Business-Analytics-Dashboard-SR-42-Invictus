# Dead Stock Alerts - Visual Design Preview

## Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVBAR (AppNavbar)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     INITIAL STATE: HERO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         AI-Powered Inventory Intelligence                │ │
│  │         (Badge with Sparkles Icon)                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│            Unlock Hidden Profit in Your Inventory             │
│            (Main headline with gradient "Profit")              │
│                                                                 │
│    Instantly identify dead stock and get actionable          │
│    business strategies...                                       │
│    (Subtitle)                                                  │
│                                                                 │
│         [Analyze Dead Stock] (Large Blue Button)              │
│                                                                 │
│  ┌──────┐  ┌──────────┐  ┌────────┐                          │
│  │  5   │  │AI-Powered│  │Instant │                          │
│  │Solu- │  │  Smart   │  │ Real-  │                          │
│  │tions │  │Analysis  │  │ Time   │                          │
│  └──────┘  └──────────┘  └────────┘                          │
│  (Feature Cards)                                              │
│                                                                 │
│  Gradient Background: Blue → Indigo → Purple                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    RESULTS STATE: ANALYSIS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  KPI CARDS (4 Column Grid)                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Dead Stock   │ │ High Risk    │ │ Total Stock  │           │
│  │     Items    │ │    Items     │ │    Units     │           │
│  │      3       │ │      1       │ │     250      │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                  (Blue / Red / Yellow / Green Borders)         │
│                                                                 │
│  SUMMARY SECTION                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Analysis Summary                                         │ │
│  │ (Gradient Background Blue → Indigo)                     │ │
│  │ Lorem ipsum dolor sit amet...                           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│  DEAD STOCK ITEMS SECTION                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Dead Stock Items Identified                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ITEM CARD (Risk-Colored)                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Product Name                  [HIGH RISK Badge]         │ │
│  │ Low sales frequency and poor turnover                  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ Current Stock: 100  │ Sales Count: 2                   │ │
│  │ Total Sold: 5       │ Days Since: 45                   │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ Recommended Action Plans                                │ │
│  │                                                         │ │
│  │ ┌──────────────┐  ┌──────────────┐                    │ │
│  │ │ Bundle with  │  │ Seasonal     │                    │ │
│  │ │ Best-Sellers │  │ Flash Sale   │                    │ │
│  │ │              │  │              │                    │ │
│  │ │ Create       │  │ Launch       │                    │ │
│  │ │ bundles...   │  │ limited...   │                    │ │
│  │ │              │  │              │                    │ │
│  │ │ Expected:    │  │ Expected:    │                    │ │
│  │ │ 40-60% in    │  │ 30-50% in    │                    │ │
│  │ │ 2-3 weeks    │  │ quick sales  │                    │ │
│  │ └──────────────┘  └──────────────┘                    │ │
│  │ (2-Column Grid)                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│  INVENTORY TABLE                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Item Name  │Stock│Sold│Count│Days│Turnover│Margin    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ Item 1     │ 100 │ 80  │ 15 │5d  │  0.8   │ 35%     │ │
│  │ Item 2     │  45 │  5  │  2 │60d │ 0.11   │ 28%     │ │
│  │ Item 3     │ 200 │ 50  │  8 │35d │ 0.25   │ 42%     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Run New Analysis] Button                                     │
│                                                                 │
│  White Background                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FOOTER                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Solution Card Color System

### Card Design (2-Column Grid)
```
┌─────────────────────────┐
│ [Icon] Solution Title   │  Category: BUNDLING
│ ────────────────────── │  Color: Blue
│                        │
│ Solution description   │
│ text goes here...      │
│                        │
│ Expected Outcome:      │
│ Move 40-60% in 2-3wks  │
└─────────────────────────┘

Card Background:  bg-blue-50
Left Border:      4px border-blue-500
Text Color:       text-blue-700
Icon Color:       text-blue-600
```

### Color Variations by Category

```
BUNDLING ━━━━━━━━━━━━━━━━━━━━━━━━━
┌───────────────────────────┐
│ 📦 Bundle with Best-Sellers│
│                           │
│ Create attractive bundles │
│ combining dead stock...   │
│                           │
│ Expected: 40-60% in 2-3wks│
└───────────────────────────┘
Background: Blue-50
Border: Blue-500
Text: Blue-700

DISCOUNT ━━━━━━━━━━━━━━━━━━━━━━━━━
┌───────────────────────────┐
│ 💵 Seasonal Flash Sale     │
│                           │
│ Launch limited-time       │
│ discount campaign...      │
│                           │
│ Expected: 30-50% cleared  │
└───────────────────────────┘
Background: Amber-50
Border: Amber-500
Text: Amber-700

CROSS-SELL ━━━━━━━━━━━━━━━━━━━━━━
┌───────────────────────────┐
│ 🔗 Cross-Sell Strategy    │
│                           │
│ Identify complementary    │
│ products and offer...     │
│                           │
│ Expected: 25-35% increase │
└───────────────────────────┘
Background: Emerald-50
Border: Emerald-500
Text: Emerald-700

PROMOTION ━━━━━━━━━━━━━━━━━━━━━━━
┌───────────────────────────┐
│ 🎁 Gift with Purchase     │
│                           │
│ Use as free gift for      │
│ purchases above...        │
│                           │
│ Expected: 50-70% movement │
└───────────────────────────┘
Background: Purple-50
Border: Purple-500
Text: Purple-700

BULK ━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌───────────────────────────┐
│ 📱 Bulk/Wholesale Offers  │
│                           │
│ Approach retailers with   │
│ special wholesale...      │
│                           │
│ Expected: 60-80% cleared  │
└───────────────────────────┘
Background: Orange-50
Border: Orange-500
Text: Orange-700
```

---

## Risk Level Color Coding

```
HIGH RISK ────────────────────────
┌─────────────────────────────────┐
│ Product Name        [HIGH RISK]  │  Background: Red-50
│                                  │  Border: Red-200
│ Item critically low on sales.    │  Badge: Red-100/Red-800
│                                  │  Text: Red-700
│ Metrics: 100 units, 2 sales      │
└─────────────────────────────────┘

MEDIUM RISK ───────────────────────
┌─────────────────────────────────┐
│ Product Name       [MEDIUM RISK] │  Background: Yellow-50
│                                  │  Border: Yellow-200
│ Item has moderate sales issues.  │  Badge: Yellow-100/Yellow-800
│                                  │  Text: Yellow-700
│ Metrics: 80 units, 5 sales       │
└─────────────────────────────────┘

LOW RISK ──────────────────────────
┌─────────────────────────────────┐
│ Product Name          [LOW RISK] │  Background: Green-50
│                                  │  Border: Green-200
│ Item selling steadily.           │  Badge: Green-100/Green-800
│                                  │  Text: Green-700
│ Metrics: 120 units, 12 sales     │
└─────────────────────────────────┘
```

---

## Typography Hierarchy

```
MAIN HEADING (Hero)
Unlock Hidden Profit in Your Inventory
(text-5xl sm:text-6xl lg:text-7xl)
font-bold, text-gray-900
Leading creates breathing room

SECONDARY HEADING
Dead Stock Items Identified
(text-3xl)
font-bold, text-gray-900

TERTIARY HEADING
Product Name
(text-2xl)
font-bold, text-gray-900

CARD TITLE
Solution Title
(text-base)
font-bold, text-gray-700/800

LABEL (Uppercase)
CURRENT STOCK
(text-xs)
font-semibold, uppercase, tracking-wide
text-gray-600

BODY TEXT
Standard paragraph text
(text-sm to text-lg)
font-normal
text-gray-700

SMALL TEXT
Supporting description
(text-xs to text-sm)
font-normal
text-gray-600 or text-gray-500
```

---

## Spacing Scale

```
Vertical Spacing (Margin/Padding)
─────────────────────────────────
Hero Section:        pt-32 pb-20
Results Section:     pt-20 pb-16
Card Content:        p-6 to p-8
Section Gap:         mb-12
Component Gap:       mb-8 or mb-6
Element Gap:         mb-3 or mb-4

Horizontal Spacing
──────────────────
Container:           max-w-6xl/7xl
Side Padding:        px-4 sm:px-6 lg:px-8
Card Grid Gap:       gap-6
Within Card:         p-6 to p-8
```

---

## Responsive Breakpoints

```
MOBILE (< 768px)
────────────────
- Single column layouts
- Full width cards
- Stacked grids
- Large touch targets
- Text-5xl for main heading

TABLET (768px - 1024px)
──────────────────────
- 2-column solutions grid
- 3-column KPI cards
- Text-6xl for main heading
- Medium padding

DESKTOP (> 1024px)
──────────────────
- Full 4-column grids
- 2-column solutions
- Text-7xl for main heading
- Max width containers
- Hover effects enabled
```

---

## Icons Used

```
React Icons from react-icons

Bundling:    BiPackage       📦
Discount:    BiDollar        💵
Cross-sell:  BiLink          🔗
Promotion:   BiGift          🎁
Bulk:        BiMobile        📱
Trending:    FiTrendingUp    📈
Alert:       FiAlertTriangle ⚠️
Target:      FiTarget        🎯
Sparkles:    HiOutlineSparkles ✨
```

---

## Interactive States

```
BUTTON HOVER
───────────
Default: bg-gradient-to-r from-blue-600 to-indigo-600
Hover:   bg-gradient-to-r from-blue-700 to-indigo-700
Shadow:  shadow-lg → shadow-xl
Cursor:  pointer

CARD HOVER
──────────
Shadow: shadow-sm → shadow-md
Transition: 300ms smooth
Transform: Slight lift effect

DISABLED STATE
──────────────
Opacity: 50%
Cursor: not-allowed
```

---

## Modern Design Features

✨ **Gradient Backgrounds**
- Hero: Blue → Indigo → Purple
- Buttons: Blue → Indigo
- Text highlights: Gradient text-clip

🎨 **Color System**
- Professional color palette
- Risk-based color coding
- Category-specific colors
- Proper contrast ratios

📱 **Responsive Design**
- Mobile-first approach
- Adaptive layouts
- Touch-friendly
- No horizontal scroll

⚡ **Smooth Animations**
- Hover transitions (300ms)
- Shadow expansion
- Spinning loader
- Page transitions

👁️ **Visual Hierarchy**
- Large headings (7xl)
- Progressive sizing
- Clear focus areas
- Professional spacing

🎯 **UX Features**
- Color-coded information
- Professional icons
- Clear metric display
- Expected outcomes visible

---

## Comparison: Before vs After

```
BEFORE (Basic Design)         AFTER (Hero Page Design)
────────────────────        ─────────────────────────
Plain white background       Gradient backgrounds
Small text headings          Large, bold headings
Basic spacing                Professional spacing
Inline colors                Color-coded system
Emoji icons                  Professional icons
Simple cards                 Premium styled cards
No animations                Smooth transitions
Basic tables                 Professional tables
Limited visual appeal        Stunning visual design
```

---

## Result: Your Most Impressive Page ✨

This is now a **professional-grade hero page** that:
- Looks like a premium product feature
- Matches your brand design
- Impresses users immediately
- Guides them smoothly through analysis
- Displays results beautifully
- Invites interaction and trust

**Ready to showcase to clients and users!**

---

**Design Version**: 2.0 Modern Hero  
**Date**: February 15, 2026  
**Status**: ✅ Live and Ready
