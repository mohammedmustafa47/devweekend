# Assessment Answers — Habit Tracker

# 1. How to Run
To set up and run this application on a fresh machine, open your terminal and execute the following sequential commands:

```bash
# 1. Navigate into the application root workspace directory
cd devweek

# 2. Install the Ionic CLI globally to guarantee terminal command recognition
npm install -g @ionic/cli

# 3. Fetch and install all matching package node modules and Angular dependencies
npm install

# 4. Boot up the local hot-reloading development server
ionic serve

# 2. Stack Choice Strategy

"Stack Choice Strategy: I chose **Angular** paired with the **Ionic CLI** because it represents my core foundation as a developer. Having started my frontend journey with Angular, this stack gives me the highest development velocity and deepest comfort level. Instead of wrestling with a new framework's syntax under a tight deadline, leveraging my native experience in Angular allowed me to focus 100% of my energy on solving complex application logic—such as real-time streak calculations, dynamic historical week queries, and granular data persistence—ensuring a more robust and polished final submission."


# 3. Responsive & Accessibility
* **Responsive Behavior Structure:**
On small screens (~360px), the dashboard switches to a compact mobile layout with stacked statistic cards, touch-friendly controls, and a horizontally scrollable habit grid to preserve readability without shrinking content excessively. On larger screens (~1440px), spacing increases and the layout expands naturally to improve visual hierarchy and scanning efficiency.

One accessibility consideration handled was color contrast and touch target sizing. Interactive elements such as checkboxes, buttons, and toggles were designed with sufficient spacing and visible hover/focus feedback for usability.

One accessibility consideration intentionally skipped was full screen-reader optimization (ARIA labels/live announcements) due to project scope and time constraints, while prioritizing responsive interaction and visual clarity first

# 4. AI Usage (Chronological: Bottom to Top)

* **Application Layout Kickstart & Core Feature Setup:**

  * **Tool:** ChatGPT / Claude
  * **Prompt:** *"add a button center with name as 'add 'it should input field a habbit name .the habbit entered by user should be displayed under the table format with attributes (haabit name and weekdays simultaneously).week days starting from monday to sunday .each weekday should have an checkbox so that when user marks it it should count steak as one and steak monitor box should monitor the steak of habbit per day and be coloured"*
  * **AI Output:** Generated the foundational Angular component template including an input management field, an iterative HTML data table stretching from Monday to Sunday, interactive checkbox inputs, and a mathematical state monitoring block to track active streaks.
  * **What I Changed & Why:** I modified the basic table structures to match our system's unified style layout and wrapped the entry inputs into a cleaner layout panel to ensure they don't block table visibility on compact viewports.

* **High-Contrast Dark Theme Aesthetics Refactoring:**
  * **Tool:** ChatGPT / Claude
  * **Prompt:** *"make the background of habit list container and top cards a lighter shade to separate them from the master background to #1e1e2f. change the table headers and habbit names to high contrast off white. give the highlighted current day a vibrant color so they can be identified in less then a fraction seconds"*
  * **AI Output:** Generated custom background configurations and high-contrast color styles.
  * **What I Changed & Why:** The initial baseline theme colors introduced massive contrast regressions where interactive panels blended blindly into the pitch-black background, creating high cognitive load. I forced specific contrast hex tokens (`#1e1e2f` and `#f8f9fa`) and added a glowing teal visual anchor to the current column, ensuring instant scannability.

* **ISO Date Object Map Structure Migration:**
  * **Tool:** ChatGPT / Claude
  * **Prompt:** *"Refactor my Angular habit tracker component architecture, layout, and logic with the following comprehensive updates. Make sure the implementation uses real date-tracking strings (e.g., 'YYYY-MM-DD') so that adding historical week/month filtration switches later will require no backend or structural overhead..."*
  * **AI Output:** Supplied a model structure tracking progress with absolute ISO date keys instead of hardcoded positional index arrays.
  * **What I Changed & Why:** I refactored the template rendering loop to inject conditional `.is-past-day` parameters, freezing older columns with custom `filter: grayscale(100%); opacity: 0.45` attributes to protect data logging integrity.

* **Dynamic Performance Filtering System:**
  * **Tool:** ChatGPT / Claude
  * **Prompt:** *"Add a Dynamic Consistency Filter to my Angular habit tracker component using our existing date-string database setup..."*
  * **AI Output:** Produced mathematical filtering scripts calculating active historical percentages inside the current month or week arrays.
  * **What I Changed & Why:** The default output utilized raw browser `<option>` dropdown arrays, which broke our curved interface aesthetic on certain viewports. I replaced it with an Angular structural `*ngIf` custom dropdown card featuring a smooth `border-radius: 12px` and `overflow: hidden`, appending colored indicators to the output string.

* **Chronological Future Day Handling:**
  * **Tool:** ChatGPT / Claude
  * **Prompt:** *"Update the weekly habit grid logic and styling to handle future calendar days. Calculate an isFuture state so upcoming days cannot be checked..."*
  * **AI Output:** Provided template checks comparing visible cells against current calendar days.
  * **What I Changed & Why:** I integrated an explicit `.is-future-day` style override applying `opacity: 0.3` and `pointer-events: none` directly to checkboxes, hiding un-loggable days from the user's focus path.

* **Historical Timeline & Inline Navigation:**
  * **Tool:** ChatGPT / Claude
  * **Prompt:** *"Refactor my Angular habit tracker component to implement historical week navigation directly inside the table grid header row..."*
  * **AI Output:** Outlined week offset calculation methods using index variations (`-1`, `0`, `+1`).
  * **What I Changed & Why:** I refactored the UI elements to sit directly inline as clickable `<` and `>` arrow markers inside the weekday header layout, creating a uniform horizontal flow.

* **Destructive Action Interception Modals:**
  * **Tool:** ChatGPT / Claude
  * **Prompt:** *"Add confirmation modals for habit logging and deletion; enhance habit tracking logic..."*
  * **AI Output:** Outlined confirmation modal components using event listeners.
  * **What I Changed & Why:** I bound the confirmation steps directly into the core mutation functions. Deletion keys and logging fields now route through an interceptor step that halts state commits until a clean CSS backdrop blur layer confirmation is verified by the user.

* **Dynamic Theme Switcher Architecture:**
  * **Tool:** ChatGPT / Claude
  * **Prompt:** *"Add theme switcher and implement dark mode support; enhance UI styling for light and dark themes using dynamic CSS variables..."*
  * **AI Output:** Outlined root-level configuration files using data-attribute mappings.


#5.Honest gap: 

The gap in my submission is the dropdown menu used for the habit filtering system. While the math and habit tracking data behind the scenes work perfectly, the actual dropdown menu is just a temporary fallback that needs a smoother design. If I had an extra day, I would replace this temporary menu with Ionic's official built-in selector tool so it looks professional on both iPhones and Androids. I would also clean up the code behind it to ensure the app handles menu selections smoothly without any hidden bugs, making the filtering experience feel much more polished for the user.