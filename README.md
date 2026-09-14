# This is my Clinic Stock Console

## Below is my project Overview

Clinic Stock Console is a web application for clinic staff to search, filter, sort, view, and correct product stock information.

This application uses the DummyJSON API (the one provided in my wrk todo) for authentication and product data.

## To access my work click the links below

Live application:
https://clinic-stock-console-sigma.vercel.app

GitHub repository:
https://github.com/nxuki/clinic-stock-console

## My Test Login Credentials

- Username: `emilys`
- Password: `emilyspass`

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Vitest
- ESLint
- Prettier
- Husky
- Commitlint
- GitHub Actions
- Vercel

## Local Setup

Clone the repository:

```bash
git clone https://github.com/nxuki/clinic-stock-console.git


## Decision


 My Decision 1: one of the things i wanted to achieve is when  the user refreshes the page the search, category, sorting and current page to remain the same. Also i wanted the user to be able to copy the url and open exactly the filtered view in another computer or browse. if i would have retained the react state , upon refreshing they will be lost.


My Decision 2:on my second decision, i decided when a sssion expires, the user should be reidrected to login page for security purposes and the same time idid not want them lose what the user was interacting with. so they wil be taken back to exactly where they left before the session expired



My Decision 3: Now my tjird decision i opted to seperated product details page because for each stock product a unique sharable link is needed. with this, when the link is shared and open on a different computer the exact page ca be accessed. in this case a modal can be simpler, but making direct linking to a particular product almost imposible

## State Management

I separated the application state depending on what the information is used for.

On Search, category, sorting and pagination are stored in the URL. This will allows the same inventory view to be retained after refreshing the page and also makes the view/page shareable with anotherperson.

TanStack Query is used to manage and cache/store product and category data received from DummyJSON.

I used sessionStorage for authentication information such as the access token and expiry time.

Local React state is used for temporary information such as form inputs, success messages and error messages.

## Data Fetching and Cache Strategy

Product and category data is fetched from DummyJSON using TanStack Query.

The product inventory is fetched and then search, category filtering, sorting and pagination are handled on the client. This also prevents an older search request from arriving after a newer search and displaying stale results.

After a successful stock correction, I update the TanStack Query cache so that the new stock value is also shown when the user returns to the inventory.

## Authentication and Session Expiry

Authentication uses the DummyJSON login endpoint with the one minute token expiry required by the assessment.

When the session expires, the application clears the session and redirects the user to the login page. The page the user was viewing is kept in a returnTo parameter.

After successful login, the application returns the user to that page instead of starting again from the beginning.

## Accessibility and Responsive Design

I designed the application so that it can be used with a keyboard and on smaller screens.

I included labels for form controls, visible keyboard focus states, alternative text for images and status/error messages.

I manually tested the application at a width of 360px and confirmed that the controls and product cards remain usable without horizontal scrolling.

## Testing

I used Vitest for automated testing.

The tests cover product fetching, single product fetching, stock updates, API failures, login requests and failed authentication.

I also manually tested search, category filtering, sorting, pagination, URL state after refresh, session expiry, stock correction, direct product links, keyboard navigation and the 360px mobile layout.

## CI/CD

I used GitHub Actions for continuous integration.

The CI workflow runs formatting checks, ESLint, automated tests and the production build.

Vercel is connected to the main branch of the GitHub repository. When new changes are pushed to main, Vercel automatically builds and deploys the latest version.

## DummyJSON Limitation

DummyJSON simulates product updates but does not permanently save them.

When stock is corrected, the application immediately updates its TanStack Query cache and displays the corrected value. If the browser is refreshed, DummyJSON is called again and returns the original stock value.

I kept this behaviour instead of pretending that the mock API permanently stores the update.

## Declaration

I used AI during this assessment to assist with project scaffolding, implementation guidance, troubleshooting, test scaffolding, tooling configuration, CI/CD setup and documentation structure.

I made the initial design decisions myself and reviewed and tested the implementation. I understand that I need to be able to explain and modify the code during the live review.
```

## My Reflections

### 1. What changed during implementation?

One thing that changed during implementation was how I handled the stock list. At first, I thought search, filtering and sorting would mainly depend on separate API requests. As I implemented the application, I decided to fetch the product list and handle search, filtering, sorting and pagination on the client because the dataset was small enough. This made the behaviour more predictable and also helped avoid stale search results from competing requests.

I also improved the session-expiry flow. Instead of simply sending the user back to the login page, I preserved the page they were viewing so they could continue from the same place after signing in again.

Another improvement was the stock correction behaviour. Since DummyJSON does not permanently save PUT updates, I updated the TanStack Query cache so the corrected stock value remains visible during the active session.

### 2. What would I do differently if I had another day?

If I had another day, I would add more UI and integration tests, especially around session expiry, filtering and URL state. I would also spend more time testing the application under slow or unstable network conditions.

I would also improve the stock correction functionality by using a real backend that permanently stores stock changes. DummyJSON only simulates updates, so the original stock value returns after a full refresh.

### 3. What was the hardest part?

The hardest part for me was getting direct product URLs to work correctly after refreshing the application on Vercel. The product pages worked when navigating through the application, but refreshing a direct product URL initially resulted in a 404 error. Solving this helped me understand client-side routing and how SPA routes need to be handled when deploying an application.

### 4. What am I most satisfied with?

I am most satisfied with preserving the search, filters, sorting and current page in the URL. This means that when a user refreshes the page or shares the URL with someone else, the same inventory view can be restored. I think this makes the application more practical and easier to use.

### 5. AI use and learning

I used AI throughout the project to help with scaffolding, implementation guidance, debugging, testing, tooling, CI/CD setup and documentation. I manually tested the application as I worked through the project, and I am reviewing the implementation so that I can explain the decisions and code during the live session.
