export const registerFormControl = [
  {
    name: "userName",
    label: "Username",
    placeholder: "Enter your username",
    componentType: "input",
    type: "text",
    validation: {
      required: true,
      minLength: 3,
      pattern: /^[a-zA-Z_]+$/,
      message: "Username must be at least 3 letters (no numbers allowed)",
    },
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
    validation: {
      required: true,
      minLength: 6,
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      message:
        "Password must contain at least 6 characters, including uppercase, lowercase, number, and special character",
    },
  },
];

export const loginFormControl = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
    validation: {
      required: true,
      message: "Please enter your password",
    },
  },
];

export const addProductsFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "men", label: "Men" },
      { id: "women", label: "Women" },
      { id: "kids", label: "Kids" },
      { id: "accessories", label: "Accessories" },
      { id: "footwear", label: "Footwear" },
    ],
  },
  {
    label: "Brand (optional)",
    name: "brand",
    componentType: "select",
    options: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      { id: "puma", label: "Puma" },
      { id: "timberland", label: "Timberland" },
      { id: "vans", label: "Vans" },
      { id: "converse ", label: "Converse " },
      { id: "new balance", label: "New Balance" },
      { id: "formal ", label: "Formal " },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter product sale price (optional)",
  },
  {
    label: "Total Stock ",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
  },
];

export const shopHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/listing",
  },
  {
    id: "men",
    label: "Men",
    path: "/listing",
  },
  {
    id: "women",
    label: "Women",
    path: "/listing",
  },
  {
    id: "kids",
    label: "Kids",
    path: "/listing",
  },
  {
    id: "accesories",
    label: "Accesories",
    path: "/listing",
  },
  {
    id: "footwear",
    label: "Footwear",
    path: "/listing",
  },
];

export const filterOptions = {
  category: [
    { id: "men", label: "Men" },
    { id: "women", label: "Women" },
    { id: "kids", label: "Kids" },
    { id: "accessories", label: "Accessories" },
    { id: "footwear", label: "Footwear" },
  ],
  brand: [
    { id: "nike", label: "Nike" },
    { id: "puma", label: "Puma" },
    { id: "adidas", label: "Adidas" },
    { id: "converse", label: "Converse" },
    { id: "timberland", label: "Timberland" },
    { id: "new balance", label: "New balance" },
    { id: "vans", label: "Vans" },
    { id: "formal", label: "Formal" },
  ],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to high" },
  { id: "price-hightolow", label: "Price: High to low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
    validation: {
      required: true,
      message: "Address is required",
    },
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
    validation: {
      required: true,
      message: "City is required",
    },
  },
  {
    label: "Zipcode",
    name: "zipcode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your Zipcode",
    validation: {
      required: true,
      pattern: /^\d{5}(?:[-\s]\d{4})?$/,
      message: "Please enter a valid zipcode",
    },
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "tel",
    placeholder: "Enter your Phone",
    validation: {
      required: true,
      pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      message: "Please enter a valid phone number",
    },
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any special instructions or notes",
    validation: {
      required: false,
    },
  },
];
