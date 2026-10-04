# COMFI: Smart Menstrual Hygiene Platform - Customer User Flow Diagram

This document contains a comprehensive, end-to-end flowchart of the **COMFI** customer journey. It tracks the user's flow starting from the Home Page landing, through diagnostic sizing quizzes, custom box configuration, catalog shopping, cart checks, authentication gates, sandbox checkout payments, and administrative status updates.

The diagram is written using **Mermaid.js** and organized into labeled subgraphs, making it clean, easy to read, and ready to print or export.

---

## COMFI End-to-End Customer Journey Flowchart

```mermaid
flowchart TD
    %% Define Styles & Classes
    classDef default fill:#fdf7e7,stroke:#d0385c,stroke-width:2px,color:#3a3a3a;
    classDef startEnd fill:#d0385c,stroke:#7e0022,stroke-width:2px,color:#fff;
    classDef action fill:#fae3e5,stroke:#d0385c,stroke-width:2px,color:#3a3a3a;
    classDef decision fill:#febac4,stroke:#7e0022,stroke-width:2px,color:#d0385c;

    Start([User visits COMFI Website]) :::startEnd --> Home[Land on Home Page]

    subgraph Landing ["1. Landing & Exploration"]
        Home --> BrowseHome[Browse features, reviews, and FAQs]
        Home --> SelectPath{Choose Shopping Path} :::decision
    end

    SelectPath -- "Diagnostic Quiz" --> TakeQuiz[Navigate to '/quiz']
    SelectPath -- "Manual Compiler" --> OpenBuilder[Navigate to '/shop' Custom Builder]
    SelectPath -- "Direct Shop" --> BrowseCatalog[Navigate to '/shop' Catalog Grid]

    subgraph Quiz ["2. Diagnostic Recommendation (Fit Quiz)"]
        TakeQuiz --> RunQuiz[Answer 4 Cycle Questions]
        RunQuiz --> CalcScore[Engine compiles scores based on answers]
        CalcScore --> FindAnchor[Identify primary needs size]
        FindAnchor --> RecommendBox[Generate personalized 20-pad bundle ratios]
        RecommendBox --> QuizActions{User Action} :::decision
        QuizActions -- "Retake" --> TakeQuiz
        QuizActions -- "Add Box to Cart" --> AuthQuiz{Is User Logged In?} :::decision
        AuthQuiz -- "No" --> LoginQuiz[Redirect to /account?redirect=/quiz]
        LoginQuiz --> CompleteAuthQuiz[User logs in or signs up]
        CompleteAuthQuiz --> DispatchQuizCart[Add custom mix to cart & redirect to /cart]
        AuthQuiz -- "Yes" --> DispatchQuizCart
    end

    subgraph CustomBuilder ["3. Custom Pack Builder"]
        OpenBuilder --> InitQty[Quantities set to 0 for all sizes]
        InitQty --> QtyAdjust[Click Plus/Minus to adjust sizes in steps of 5]
        QtyAdjust --> LivePreview[Render visual pad stack inside live preview box]
        LivePreview --> MinCheck{Is total count >= 10?} :::decision
        MinCheck -- "No" --> DisableAdd[Lock Cart Button & show helper warning]
        MinCheck -- "Yes" --> CalcPricing[Calculate prices & check discount eligibility]
        CalcPricing --> DiscountCheck{Is total count >= 20?} :::decision
        DiscountCheck -- "Yes" --> ApplyDiscount[Apply 10% bundle discount]
        DiscountCheck -- "No" --> NoDiscount[Calculate standard unit pricing]
        ApplyDiscount & NoDiscount & DisableAdd --> CustomActions{User Action} :::decision
        CustomActions -- "Adjust quantities" --> QtyAdjust
        CustomActions -- "Add Custom Bundle" --> AuthCustom{Is User Logged In?} :::decision
        AuthCustom -- "No" --> LoginCustom[Redirect to /account?redirect=/shop]
        LoginCustom --> CompleteAuthCustom[User logs in or signs up]
        CompleteAuthCustom --> DispatchCustomCart[Add Custom Box items to cart & clear inputs]
        AuthCustom -- "Yes" --> DispatchCustomCart
    end

    subgraph ShopCatalog ["4. Traditional Catalog Shopping"]
        BrowseCatalog --> ViewProduct[Click Product Card -> View specific features & reviews]
        ViewProduct --> CatalogActions{User Action} :::decision
        CatalogActions -- "Add to Wishlist" --> WishlistToggle[Save item to LocalStorage wishlist]
        CatalogActions -- "Add Single Pack" --> DispatchSingleCart[Add 10-pack item to cart]
    end

    DispatchQuizCart & DispatchCustomCart & DispatchSingleCart & WishlistToggle --> CartHome[Navigate to '/cart']

    subgraph CartModule ["5. Shopping Cart Management"]
        CartHome --> RenderCart[Load cart state from AppContext]
        RenderCart --> CartCheck{Is Cart Empty?} :::decision
        CartCheck -- "Yes" --> ShopLink[Show empty cart message -> Link to /shop]
        CartCheck -- "No" --> EditCart[Modify quantities or remove cart items]
        EditCart & ShopLink --> CartActions{User Action} :::decision
        CartActions -- "Keep Shopping" --> BrowseCatalog
        CartActions -- "Proceed to Checkout" --> RouteCheckout[Navigate to '/checkout']
    end

    subgraph CheckoutAuth ["6. Auth & Checkout Gateways"]
        RouteCheckout --> LoadCheckout[Load Shipping & Billing Address Form]
        LoadCheckout --> EnterDetails[Enter Recipient Name, Phone, and Address]
        EnterDetails --> PlaceOrder[Click 'Place Order']
    end

    PlaceOrder --> PostOrder[Send order payload to /api/checkout/create-order]

    subgraph PaymentOrder ["7. Payment & Order Completion"]
        PostOrder --> OrderCreated[Database saves order status as 'Pending']
        OrderCreated --> CheckGateway{Are payment keys configured?} :::decision
        CheckGateway -- "Yes (Razorpay)" --> RazorpayPop[Open Razorpay payment popup]
        RazorpayPop --> RazorpayVerify[POST transaction receipt to /api/checkout/verify-payment]
        CheckGateway -- "No (Local/Offline)" --> MockPop[Open interactive Mock Payment Simulator overlay]
        MockPop --> MockVerify[POST simulator data to /api/checkout/mock-confirm]
        
        RazorpayVerify & MockVerify --> PaymentResult{Payment Authorized?} :::decision
        PaymentResult -- "Yes" --> SetPaid[Order Status set to 'Paid' & clear cart state]
        PaymentResult -- "No" --> SetFailed[Retain cart items & display error dialog]
    end

    SetPaid --> SuccessPage[Redirect to Order Success Confirmation page]
    SetFailed --> LoadCheckout

    subgraph PostPurchase ["8. Profile & Order Tracking"]
        SuccessPage --> OpenProfile[Navigate to '/account' Profile Dashboard]
        OpenProfile --> ViewOrders[Fetch orders from /api/orders/my-orders]
        ViewOrders --> TrackShipment[View fulfillment status: Pending -> Processing -> Shipped -> Delivered]
        TrackShipment --> End([User logs out or shops again]) :::startEnd
    end
```

---

## Detailed Step-by-Step Flow Explanation

### 1. Landing & Exploration
* **Home Page Interaction**: The user enters the site and is presented with the D2C landing interface. They can scroll down to read product quality descriptions, view active customer reviews, read the FAQs, and explore the collections.
* **Navigation Choices**: The interface provides three main paths to begin purchasing:
  1. **Diagnostic Quiz**: Takes users through a personalized period fit quiz to suggest a box profile.
  2. **Manual Pack Builder**: Allows users to configure exact box ratios themselves.
  3. **Direct Shop**: Traditional e-commerce catalog search for standard pre-packaged boxes.

### 2. Diagnostic Quiz Flow
* **Questions & Scores**: The user is guided through four multiple-choice questions assessing cycle flow patterns, leakage issues, priorities, and periodic physical activities.
* **Scoring Logic**: Each option updates scoring counts for the core pad sizes (Regular, Large, XL, Overnight).
* **Ratios Recommendation**: The system identifies the size with the highest weight and presents a custom 20-pad pack ratio:
  * *Regular Anchor*: 10 Regular, 5 Large, 5 XL, 0 Overnight.
  * *Large Anchor*: 5 Regular, 10 Large, 5 XL, 0 Overnight.
  * *XL Anchor*: 0 Regular, 5 Large, 10 XL, 5 Overnight.
  * *Overnight Anchor*: 5 Regular, 5 Large, 5 XL, 5 Overnight.
* **Cart Dispatch**: Clicking "Add Recommended Box" checks the login session. If the user is unauthenticated, they are redirected to login/signup. Once authenticated, the personalized bundle is added to their cart.

### 3. Custom Pack Builder Flow
* **Custom Mix Controls**: The user starts from a zero count. They can adjust pad quantities for any size in multiples of 5.
* **Package Checking Constraints**: Cart insertion requires a minimum total count of **10 pads**.
* **10% Bundle Discount Rule**: Triggered dynamically when the total cumulative count reaches or exceeds **20 pads**.
* **Visual Stack Drawer**: The custom builder updates a dynamic UI stack inside a 3D box graphic representing the proportions of the selected sizes.
* **Cart Dispatch**: On clicking "Add Custom Bundle", login state is validated. If the user is logged in, the custom box is committed to the cart state, and input quantities reset.

### 4. Direct Shop Catalog Grid
* **E-Commerce Cards**: Users can browse the catalog grid containing standard pre-packaged items (10-packs).
* **Actions**: Users can add items directly to their cart or click the Heart icon to save items to their persistent LocalStorage wishlist.

### 5. Shopping Cart Management
* **Cart State**: Loads all standard items and custom box configurations from `LocalStorage` through the React `AppContext`.
* **State Updates**: Users can increment/decrement individual item quantities or remove them, with the total price updating dynamically.
* **Route**: Clicking "Proceed to Checkout" advances the user to the checkout module.

### 6. Auth & Checkout Gateways
* **Address Entry**: The user fills out shipping information (recipient name, telephone contact, street address, and city destination).
* **Payload Posting**: Clicking "Place Order" transmits standard items and custom box descriptions to the order creation endpoint (`/api/checkout/create-order`).

### 7. Payment Verification & Order Completion
* **Order Creation**: An order state record is saved in the database with status set to `Pending`.
* **Gateway Selector**:
  * **Razorpay Enabled**: If API credentials are configured in `.env.local`, the Razorpay sandbox payment pop-up launches. Upon entry of test details, the server verifies the payment receipt at `/api/checkout/verify-payment`.
  * **Mock Simulator Fallback**: If keys are absent, an overlay sandbox simulator modal is loaded, and users can trigger a simulated success signal sent to `/api/checkout/mock-confirm`.
* **Payment Finalization**: On successful payment confirmation, the order status changes to `Paid`, the database inventories decrement, and the browser cart is cleared.

### 8. Profile Tracking & History
* **Profile Dashboard**: The user is redirected to the `/account` profile tab.
* **History Feed**: The page fetches transaction histories from `/api/orders/my-orders`.
* **Tracking Status**: Displays the shipping fulfillment process updated by administrators (Pending ➔ Processing ➔ Shipped ➔ Delivered).
