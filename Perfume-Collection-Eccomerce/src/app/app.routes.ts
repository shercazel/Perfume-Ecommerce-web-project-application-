import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { About } from './pages/about/about';
import { Collection } from './pages/collection/collection';
import { AdminLayout } from './Layout/admin/admin-layout/admin-layout';
import { UserLayout } from './Layout/userLayout/user-layout/user-layout';
import { RomanceCollection } from './pages/collection/romance_collection/romance-collection/romance-collection';
import { AllCollection } from './pages/collection/all_collection/all-collection/all-collection';
import { BrandCollection } from './pages/collection/brandcollection/brand-collection/brand-collection';
import { BoldCollection } from './pages/collection/bold_collection/bold-collection/bold-collection';
import { SweetCollection } from './pages/collection/sweet_collection/sweet-collection/sweet-collection';
import { NightCollection } from './pages/collection/nightCollection/night-collection/night-collection';
import { OfficeCollection } from './pages/collection/office_collection/office-collection/office-collection';
import { MenCollection } from './pages/collection/men_collection/men-collection/men-collection';
import { WomenCollection } from './pages/collection/women_collection/women-collection/women-collection';
import { AddToCartContainer } from './modal/add_cart_container/add-to-cart-container/add-to-cart-container';
import { PerfumeQuiz } from './pages/quiz/perfume-quiz/perfume-quiz';
import { PromoDiscount } from './pages/promo/promo-discount/promo-discount';
import { CartProduct } from './pages/cart_product/cart-product/cart-product';
import { authGuard } from './guards/auth-guard';
import { Login } from './auth/login/login/login';
import { Signup } from './auth/signUp/signup/signup';
import { ResetPassword } from './auth/resetPassword/reset-password/reset-password';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { AdminModulePage } from './pages/admin/admin-module-page/admin-module-page';

export const routes: Routes = [
  {
    path: '',
    component: UserLayout,

    children: [
      {
        path: '',
        component: HomePage,

        children: [
          {
            path: 'quiz',
            component: PerfumeQuiz,
          },
        ],
      },

      {
        // for filtering purpose
        path: 'collection',
        component: Collection,

        children: [
          {
            path: '',
            component: AllCollection,
          },
          {
            path: 'romance',
            component: RomanceCollection,
          },
          {
            path: 'brandCollection',
            component: BrandCollection,
          },
          {
            path: 'Bold',
            component: BoldCollection,
          },
          {
            path: 'Sweet',
            component: SweetCollection,
          },
          {
            path: 'NightParty',
            component: NightCollection,
          },
          {
            path: 'Office',
            component: OfficeCollection,
          },
          {
            path: 'Men',
            component: MenCollection,
          },
          {
            path: 'Women',
            component: WomenCollection,
          },
        ],
      },
      // end here
      {
        path: 'cartProduct',
        component: CartProduct,
        canActivate: [authGuard],
      },
      {
        path: 'about',
        component: About,
      },

      {
        path: 'showCart',
        component: AddToCartContainer,
        canActivate: [authGuard],
      },
      {
        path: 'promoDiscount',
        component: PromoDiscount,
      },
    ],
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'createAccount',
    component: Signup,
  },
  {
    path: 'resetPassword',
    component: ResetPassword,
  },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        component: AdminDashboard,
      },
      {
        path: 'products',
        component: AdminModulePage,
        data: {
          title: 'Products',
          description: 'Manage perfume products, prices, stocks, and product visibility.',
        },
      },
      {
        path: 'orders',
        component: AdminModulePage,
        data: {
          title: 'Orders',
          description: 'Track customer orders, statuses, payments, and fulfillment.',
        },
      },
      {
        path: 'users',
        component: AdminModulePage,
        data: {
          title: 'Users',
          description: 'View registered customers and account activity.',
        },
      },
      {
        path: 'categories',
        component: AdminModulePage,
        data: {
          title: 'Categories',
          description: 'Organize perfume collections, scent types, and category groups.',
        },
      },
      {
        path: 'banners',
        component: AdminModulePage,
        data: {
          title: 'Banners',
          description: 'Manage homepage banners, campaign images, and promotional displays.',
        },
      },
      {
        path: 'sales',
        component: AdminModulePage,
        data: {
          title: 'Sales',
          description: 'Review sales performance once orders start coming in.',
        },
      },
      {
        path: 'top-products',
        component: AdminModulePage,
        data: {
          title: 'Top Products',
          description: 'Monitor best-selling perfumes and product demand.',
        },
      },
      {
        path: 'user-trends',
        component: AdminModulePage,
        data: {
          title: 'User Trends',
          description: 'Analyze customer registrations and user growth over time.',
        },
      },
      {
        path: 'reports',
        component: AdminModulePage,
        data: {
          title: 'Reports',
          description: 'Generate summaries for sales, orders, users, and inventory.',
        },
      },
      {
        path: 'profile',
        component: AdminModulePage,
        data: {
          title: 'Profile',
          description: 'Manage admin profile information and account preferences.',
        },
      },
      {
        path: 'settings',
        component: AdminModulePage,
        data: {
          title: 'Settings',
          description: 'Configure admin panel behavior and system preferences.',
        },
      },
    ],
  },
];
