# LoungeOS - Complete Feature Documentation

**LoungeOS** is a comprehensive management solution designed for lounges, restaurants, and hospitality businesses. This document provides a detailed overview of all features across the platform.

---

## 🎯 Core Features Overview

### ✅ **100% Offline Functionality**

- Complete local operation without internet dependency
- SQLite database for robust data persistence
- Local file storage for images and backups
- Optimized for local network deployment

### 🌐 **Multi-Language Support**

- **Default Language**: French
- **Available Languages**: English, French
- Language preference stored in browser local storage
- Bilingual knowledge base and documentation

### 🎨 **Modern UI/UX Design**

- Predominantly black and white UI with strategic color accents (red, blue, green)
- Rounded corners on all buttons and cards
- Touch-optimized interface for tablets and touchscreens
- Responsive design (phones, tablets, desktop monitors)
- Built with Shadcn UI components and Radix UI primitives
- Dark mode support with elegant glassmorphism effects

---

## 👥 User Authentication & Role Management

### **Secure Authentication System**

- Email/password-based login
- Bcrypt password hashing for security
- Forced password change on first login
- Password reset and forgot password functionality
- Automatic session expiration after 2 hours of inactivity

### **Role-Based Access Control (RBAC)**

The system supports 8 different user roles with specific permissions:

#### 🔐 **Super Admin**

- **Access Level**: Full unrestricted access
- **Capabilities**:
  - Complete system configuration
  - All administrative functions
  - Cannot be deleted (protected account)
  - Database initialization and seeding

#### 👔 **Manager**

- **Access Level**: Dashboard, Reports, Accounting, POS, Kitchen, Bar
- **Capabilities**:
  - Manage floors, tables, and staff
  - Access all reporting and analytics
  - Configure meals, categories, and suppliers
  - Full operational oversight

#### 💰 **Accountant**

- **Access Level**: Accounting Module, Dashboard, Reports
- **Capabilities**:
  - Financial records and journal entries
  - Revenue and expense tracking
  - Financial reporting and analysis
  - View orders, meals, and inventory

#### 📦 **Stock Manager**

- **Access Level**: Inventory, Suppliers
- **Capabilities**:
  - Full inventory management
  - Stock adjustments and movements
  - Supplier management
  - View meals catalog

#### 👨‍🍳 **Chef**

- **Access Level**: Kitchen Display
- **Capabilities**:
  - Manage kitchen orders
  - Update order status (Pending → In Progress → Ready)
  - Manage meals and recipes
  - Real-time order notifications

#### 🍽️ **Waiter**

- **Access Level**: POS, Table Management
- **Capabilities**:
  - Take customer orders
  - Limited to assigned floor
  - Manage tables (mark dirty, reserved, etc.)
  - Process table assignments

#### 💵 **Cashier**

- **Access Level**: POS, Payment Processing
- **Capabilities**:
  - Process customer payments
  - Multiple payment methods support
  - Generate receipts
  - Access bar display

#### 🍹 **Bartender**

- **Access Level**: Bar Display
- **Capabilities**:
  - Manage drink orders
  - Update order status
  - View bar-specific orders

---

## 📊 Dashboard & Analytics

### **Main Dashboard** (`/dashboard`)

#### **Real-Time KPI Cards**

- Total Revenue (with % change)
- Daily Sales (with trend indicators)
- Cash Flow (with % change)
- Total Orders
- Completed Orders
- Pending Orders
- Canceled Orders
- Active Tables

#### **Interactive Tabs**

##### 📈 **Overview Tab**

- Revenue & Orders Trend Charts (last 30 days)
- Recent Sales List
- Pending Orders Table
- Top Selling Products

##### 📊 **Analytics Tab**

- Sales by Category (Bar Chart)
- Revenue Distribution (Pie Chart)
- Advanced visual analytics

##### 🏆 **Performance Tab**

- Staff Performance Metrics
  - Total sales per staff member
  - Number of orders placed
  - Average order value
- Recent Activity Logs

##### 🛠️ **Tools Tab**

- Interactive Calendar
- Quick Notes (with add/edit/delete)
- Event tracking

#### **Dashboard Controls**

- Date range filtering (Last 7/30/90 days, 1 year, custom)
- Live data indicator
- Auto-refresh every 30 seconds
- Manual refresh button

---

## 💳 Point of Sale (POS)

**Location**: `/dashboard/pos`

### **Core POS Features**

- Visual product grid with images and category icons
- Real-time table status display
- Multiple payment method support:
  - 💵 Cash
  - 💳 Card/Bank Transfer
  - 📱 Mobile Money (MTN, Orange Money)
- Split payment functionality
- Discount application
- Order notes and special instructions

### **Transaction Processing**

- Unique transaction ID generation
- Automatic stock deduction on payment
- Receipt generation and printing
- Payment history tracking
- Cashier attribution

### **Receipt Features**

- Business name and address
- Transaction date/time
- Itemized order list with quantities and prices
- Total amount in configured currency
- Payment method
- Unique transaction ID
- Waiter/server name
- Optimized for thermal printer (1/3 A4 width)

---

## 🍳 Kitchen Management

**Location**: `/dashboard/kitchen`

### **Kitchen Display System**

- **Kanban-Style Board** with columns:
  - 📋 Pending
  - ⚙️ In Progress
  - ✅ Ready
  - 🎉 Completed

### **Features**

- Real-time order notifications with sound alerts
- Drag-and-drop order status updates
- Automatic order removal when paid
- Order details with:
  - Table number
  - Timestamp
  - Items and quantities
  - Special instructions
- Filter by status
- Visual priority indicators

---

## 🍹 Bar Management

**Location**: `/dashboard/bar`

### **Bar Display System**

- Similar Kanban-style interface to Kitchen
- Drink-specific order filtering
- Real-time notifications for new drink orders
- Status tracking (Pending → In Progress → Ready)
- Automatic completion on payment

---

## 📦 Inventory Management

**Location**: `/dashboard/inventory`

### **Comprehensive 3-Page System**

#### 📊 **1. Inventory Dashboard**

- **Key Metrics**:

  - Total Inventory Value
  - Total Items
  - Low Stock Alerts
  - Out of Stock Items
  - Items by Category
  - Recent Movements

- **Visual Analytics**:
  - Stock Level Distribution Chart
  - Inventory Value by Category
  - Stock Movements Timeline

#### 📋 **2. Stock Items** (`/dashboard/inventory`)

- **Full CRUD Operations**: Create, Read, Update, Delete
- **Advanced Table Features**:

  - Real-time search
  - Column filtering
  - Sorting (all columns)
  - Pagination
  - Bulk actions

- **Stock Item Properties**:

  - SKU (unique identifier)
  - Name and Description
  - Category
  - Unit of measurement
  - Current stock level
  - Minimum stock level (for alerts)
  - Maximum stock level
  - Cost per unit
  - Supplier assignment
  - Product image

- **Stock Adjustments**:

  - Stock IN (purchases, deliveries)
  - Stock OUT (usage, sales)
  - Adjustments (corrections)
  - Transfers (between locations)
  - Waste/Damage/Theft tracking

- **Import/Export**:

  - CSV import with template download
  - Custom date-range stock movement export (CSV/PDF)
  - Automatic category creation on import
  - Professional PDF headers with organization logo and address

- **Stock Status Indicators**:
  - ✅ In Stock (green)
  - ⚠️ Low Stock (yellow)
  - ❌ Out of Stock (red)

#### 🏢 **3. Suppliers** (`/dashboard/suppliers`)

- Full supplier CRUD
- Supplier information:
  - Name
  - Contact person
  - Phone number
  - Email address
  - Physical address
- Advanced table with search and filtering
- Import/Export capabilities

---

## 🍽️ Meals Management

**Location**: `/dashboard/meals`

### **Meal Catalog Features**

- Full CRUD operations for menu items
- **Meal Properties**:
  - Name
  - Category (Food, Whiskey, Wine, Beer, Soft Drinks, etc.)
  - Price (in configured currency)
  - Available quantity
  - Product image (5MB max, displayed as squares)
  - Variations (Small, Medium, Large)
  - Ingredient linking

### **Features**:

- Category-based organization
- Visual product grid
- Price management
- Stock tracking
- Default placeholder images
- Search and filtering
- Import/Export (CSV)

---

## 📁 Category Management

**Location**: `/dashboard/categories`

### **Features**

- Create, edit, and delete categories
- Icon selection from predefined set
- Differentiate food vs. beverage categories
- **Default Categories**:
  - 🍔 Food
  - 🥃 Whiskey
  - 🍷 Wine
  - 🍺 Beer
  - 🥤 Soft Drinks

### **Smart Category Handling**

- Automatic category creation during CSV import
- Product reassignment on category deletion
- Category icons for visual organization

---

## 🏢 Floor & Table Management

### **Floors** (`/dashboard/floors`)

- Create and manage service areas (e.g., Main Floor, VIP Lounge, Terrace)
- Assign staff to specific floors
- Visual floor layouts

### **Tables** (`/dashboard/tables`)

- **Table Properties**:

  - Name/Number
  - Capacity (seats)
  - Floor assignment
  - Status (Available, Occupied, Reserved)
  - Visual status indicators

- **Table Management**:
  - Mark tables as dirty/waiting for cleanup
  - Reserve tables
  - Merge and split tables
  - Real-time status updates
  - **Bulk Actions**: Move multiple tables to floors, update statuses, or delete in bulk

---

## 👨‍💼 Staff Management

**Location**: `/dashboard/staff`

### **Staff Features**

- **Full CRUD Operations**: Add, Edit, Activate, Deactivate, Delete
- **Staff Information**:
  - Name
  - Email (unique, login credential)
  - Phone (optional)
  - Role assignment
  - Floor assignment (for waiters)
  - Avatar/profile picture
  - Hire date
  - Status (Active, Away)

### **Account Management**

- Auto-generate initial passwords
- Force password change on first login
- Admin password reset capability
- Activity history per staff member
- Login/logout tracking

### **Performance Tracking**

- Individual sales metrics
- Number of orders placed
- Average order value
- Filterable by date range

---

## 💰 Accounting Module

**Location**: `/dashboard/accounting`

### **Accounting Dashboard**

- **Key Financial Metrics**:

  - Net Profit (current month, research-backed)
  - Total Revenue (synced from POS)
  - Total Expenses (synced from Inventory)
  - Profit Margin %
  - Month-over-month changes

- **Visual Analytics**:
  - Revenue vs. Expenses Area Chart
  - 12-month trend analysis

### **Journals** (`/dashboard/accounting/journals`)

- Manual journal entry system
- Automated syncing from POS sales and inventory movements
- Debit/credit recording with balanced entry validation
- Transaction history and account classification
- Export to PDF with professional branding

### **Chart of Accounts** (`/dashboard/accounting/chart-of-accounts`)

- Manage business account hierarchy
- Classify accounts: Assets, Liabilities, Equity, Revenue, Expenses
- Add/edit custom accounts for granular financial tracking

### **Financial Reports** (`/dashboard/accounting/reports`)

- Income Statement (Profit & Loss)
- Balance Sheet
- Cash Flow Statement
- Automated data population via accounting sync
- Custom date range filtering
- Export to CSV/PDF with organization logo and headers

---

## 📊 Reports & Analytics

**Location**: `/dashboard/reports`

### **Available Reports**

#### 💵 **Sales Reports**

- Total revenue by date range
- Sales by product category
- Sales by staff member
- Payment method breakdown
- Hour-by-hour sales analysis

#### 📦 **Inventory Reports**

- Stock levels summary
- Stock movement history
- Low stock alerts
- Stock valuation report
- ABC analysis (value-based categorization)

#### 👥 **Staff Performance Reports**

- Sales per waiter/cashier
- Orders processed
- Average transaction value
- Efficiency metrics
- Date range filtering

#### 💰 **Financial Reports**

- Revenue trends
- Expense analysis
- Profit margins
- Category-wise performance
- Custom period comparison

### **Report Features**

- **Filtering**: By date range, category, staff, payment method
- **Export**: CSV and PDF formats
- **Visualization**: Charts and graphs
- **Print-Ready**: Formatted for printing

---

## ⚙️ Configuration & Settings

**Location**: `/dashboard/configuration`

### **Financial Settings**

#### 💱 **Currency Management**

- **Default Currency**: XAF (Central African CFA Franc)
- **Supported Currencies**:

  - XAF (Central African Franc)
  - USD (United States Dollar)
  - EUR (Euro)
  - GBP (British Pound)
  - NGN (Nigerian Naira)
  - GHS (Ghanaian Cedi)

- **Currency Configuration**:
  - Symbol position (before/after amount)
  - Add/remove currencies
  - Change default currency
  - Locale-specific formatting

#### 💸 **Tax Management**

- Enable/disable tax calculation
- Multiple tax rate support
- **Pre-configured Rates**:
  - VAT (19%) - Default
  - GST (10%)
  - PST (5%)
- Add custom tax rates
- Set default tax rate

#### 🏷️ **Discount Management**

- Enable/disable discounts
- **Discount Types**:
  - Percentage-based discounts
  - Fixed amount discounts
- **Pre-configured Rules**:
  - No Discount (0%)
  - 10% Discount
  - 20% Discount
  - Fixed 1000 FCFA Discount
- Activate/deactivate individual rules
- Create custom discount rules

### **Business Settings**

- Business name and address
- Contact information
- Operating hours
- Receipt customization
- Logo upload

### **System Settings**

- Session timeout configuration
- Auto-refresh intervals
- Backup settings
- Language preferences

---

## 📅 Events & Credits

### **Events** (`/dashboard/events`)

- Create and manage special events
- Event calendar view
- Track event-related sales
- Special pricing for events
- Reservation management

### **Credits** (`/dashboard/credits`)

- Customer credit system
- Track credit balances
- Payment plans
- Credit history

---

## 📖 Knowledge Base

**Location**: `/dashboard/knowledge-base`

### **Features**

- Bilingual searchable articles (English/French)
- Step-by-step guides for:
  - Using the POS system
  - Managing inventory
  - Processing payments
  - Generating reports
  - Troubleshooting common issues
- Video tutorials
- FAQ section
- Contact support information

---

## 🎫 Support & Ticketing

**Location**: `/dashboard/support`

### **Internal Ticketing System**

- **Ticket Properties**:
  - Title and description
  - Priority (Low, Medium, High, Urgent)
  - Category (IT, Maintenance, Equipment, etc.)
  - Status (Open, In Progress, Resolved, Closed)
  - Creator and assignee
  - Timestamps

### **Features**

- Create support requests
- Assign tickets to staff
- Track resolution progress
- Ticket history and comments
- Priority-based sorting
- Status filters

---

## 📋 Activity Logging & Audit Trail

**Location**: `/dashboard/activity`

### **Comprehensive Logging**

- All significant user actions logged:
  - Login/logout events
  - Staff account management
  - Sales transactions
  - Inventory adjustments
  - Password changes
  - Configuration changes
  - Order modifications

### **Log Details**

- User ID and name
- Action type
- Timestamp
- Action details/description
- IP address (if applicable)

### **Features**

- Searchable activity history
- Filter by user, action type, date
- Export logs for auditing
- Real-time activity monitoring

---

## 💾 Backup & Data Management

**Location**: `/dashboard/backup`

### **Automated Backups**

- Daily automated backups of SQLite database
- Scheduled backup to specified local network location
- Configurable backup retention period
- Backup integrity verification

### **Manual Backups**

- On-demand database backup
- Export all data to CSV
- Backup configuration settings
- Image file backups

### **Data Recovery**

- Restore from backup procedure
- Point-in-time recovery
- Data integrity checks
- Rollback capabilities

### **Backup Scheduler Context**

- Configure backup frequency
- Set backup destination
- Email notifications on backup completion/failure
- Storage monitoring

---

## 🔧 Technical Architecture

### **Technology Stack**

- **Frontend**: Next.js 15.5.3, React 18.3.1
- **UI Library**: Shadcn UI, Radix UI, Tailwind CSS
- **Database**: SQLite (better-sqlite3)
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod validation
- **Icons**: Lucide React
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **Date Handling**: date-fns
- **Drag & Drop**: dnd-kit
- **Authentication**: bcryptjs for password hashing

### **Database Schema**

- **Users**: Staff accounts and authentication
- **Products**: Meal catalog
- **Categories**: Product categorization
- **Orders**: Order records
- **Order Items**: Order line items
- **Payments**: Payment transactions
- **Floors**: Service areas
- **Tables**: Table management
- **Suppliers**: Supplier information
- **Inventory Items**: Raw materials and stock
- **Inventory Movements**: Stock tracking
- **Tickets**: Support tickets
- **Activity Logs**: Audit trail
- **Settings**: System configuration

### **Performance Optimizations**

- Real-time search (< 1ms response)
- Optimized database queries with indexing
- Lazy loading for large datasets
- Pagination for table views
- Image optimization and caching
- Auto-refresh with configurable intervals

### **Security Features**

- Role-based access control (RBAC)
- Bcrypt password hashing
- Forced password changes
- Session timeout (2 hours)
- SQL injection prevention
- XSS protection
- CSRF tokens
- Encrypted critical data (AES-256)
- Comprehensive audit logging

---

## 🎨 Design System

### **Color Palette**

- **Primary**: Dark Blue (#2c3e50) - Professional atmosphere
- **Background**: Off-white (#f0f0f0) - Clean backdrop
- **Accent**: Soft Red (#e74c3c) - Critical actions
- **Additional**: Green for success, Yellow for warnings

### **Typography**

- **Headlines**: 'Poppins', sans-serif - Clean and modern
- **Body**: 'PT Sans', sans-serif - Readable for long text

### **Icon System**

- Lucide React icon library
- Consistent visual language
- Accessible and recognizable

### **UI Components**

- Rounded buttons for modern touch-friendly interface
- Card-based layouts
- Responsive grid system
- Toast notifications
- Modal dialogs
- Dropdown menus
- Tabs and accordions
- Progress indicators

---

## 📱 Responsive Design

### **Device Support**

- **Desktop**: Full-featured interface
- **Tablets**: Touch-optimized POS and kitchen displays
- **Mobile**: Responsive layouts with condensed views

### **Touch Interactions**

- Large touch targets (minimum 44x44px)
- Gesture support (swipe, drag)
- No hover-dependent interactions
- Touch-friendly form controls

---

## 🚀 Getting Started

### **Installation**

```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Seed default users
npm run db:seed

# Start development server
npm run dev
```

### **Default Login Credentials**

All default accounts use password: `password`

- **Super Admin**: superadmin@lounge.com
- **Manager**: manager@lounge.com
- **Accountant**: accountant@lounge.com
- **Stock Manager**: stock@lounge.com
- **Chef**: chef@lounge.com
- **Waiter (Main Floor)**: waiter-main@lounge.com
- **Waiter (VIP Lounge)**: waiter-vip@lounge.com
- **Cashier**: cashier@lounge.com
- **Bartender**: bartender@lounge.com

### **Production Deployment**

```bash
# Build for production
npm run build

# Start production server
npm run start
```

---

## 📚 Documentation

Comprehensive documentation available in `/docs`:

- `authentication.md` - Authentication system and roles
- `blueprint.md` - Complete feature blueprint
- `database.md` - Database schema and setup
- `features.md` - Feature overview
- `local-database-setup.md` - Database deployment guide

---

## 🎯 Key Highlights

### ✨ **What Makes LoungeOS Special?**

1. **100% Offline**: No internet required, perfect for local deployments
2. **Multi-Language**: Full French and English support
3. **Role-Based Security**: 8 distinct roles with specific permissions
4. **Real-Time Updates**: Live dashboard with auto-refresh
5. **Comprehensive Reporting**: Detailed analytics and insights
6. **Touch Optimized**: Perfect for tablets and touchscreen POS systems
7. **Modern UI**: Beautiful, intuitive interface
8. **Complete Audit Trail**: Every action logged for accountability
9. **Flexible Currency**: Support for multiple currencies with XAF default
10. **Automated Backups**: Daily backups with recovery procedures

### 🎁 **Bonus Features**

- Dashboard calendar and quick notes
- Drag-and-drop order management
- Visual status indicators throughout
- PDF receipt generation
- CSV import/export for bulk operations
- Sound notifications for new orders
- Session management with auto-logout
- Password strength requirements
- Image uploads for products and staff

---

## 💡 Use Cases

LoungeOS is perfect for:

- Restaurants and cafes
- Bars and lounges
- Hotels and resorts
- Food courts
- Catering businesses
- Event venues
- Any hospitality business requiring comprehensive management

---

## 🔮 Future Enhancements

Potential future features include:

- Multi-location support
- Customer loyalty programs
- Online ordering integration
- Kitchen display on multiple screens
- Advanced inventory forecasting
- Recipe costing and food cost analysis
- Employee scheduling system
- Table reservation system with customer database
- SMS/Email notifications
- Mobile apps for waiters
- Integration with payment gateways
- Cloud sync option for multi-location businesses

---

## 📞 Support

For support and documentation:

- Internal Knowledge Base: `/dashboard/knowledge-base`
- Support Tickets: `/dashboard/support`
- Documentation: `/docs` folder

---

**LoungeOS** - Complete Restaurant Management Solution
_Built with ❤️ by Sunyin Elisbrown Sigala using Next.js, React, and SQLite_
