export const registerFormControl = [
  {
    name: "userName",
    label: "Username",
    placeholder: "Enter your username",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];
export const loginFormControl = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
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
    label: "Brand",
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
        {id: 'men', label: 'Men'},
        {id: 'women', label: 'Women'},
        {id: 'kids', label: 'Kids'},
        {id: 'accessories', label: 'Accessories'},
        {id: 'footwear', label: 'Footwear'},
    ],
    brand: [
        {id: 'nike', label: 'Nike'},
        {id: 'puma', label: 'Puma'},
        {id: 'adidas', label: 'Adidas'},
        {id: 'timberland', label: 'Timberland'},
        {id: 'new balance', label: 'New balance'},
        {id: 'vans', label: 'Vans'},
        {id: 'formal', label: 'Formal'},
    ],
}

export const sortOptions = [
    { id: 'price-lowtohigh', label: 'Price: Low to high' },
    { id: 'price-hightolow', label: 'Price: High to low' },
    { id: 'title-atoz', label: 'Title: A to Z' },
    { id: 'title-ztoa', label: 'Title: Z to A' },
];

export const addressFormControls = [
  {
    label: 'Address',
    name: 'address',
    componentType: 'input',
    type: 'text',
    placeholder: 'Enter your address',
    required: true,
  },
  {
    label: 'City',
    name: 'city',
    componentType: 'input',
    type: 'text',
    placeholder: 'Enter your city',
    required: true,
  },
 { 
  label:'Zipcode',
  name: 'zipcode',
componentType: 'input',
type: 'text',
placeholder: 'Enter your Zipcode',

},
{
label: 'Phone',
name: 'phone',
componentType: 'input',
type: 'text',
placeholder: 'Enter your Phone',
},
{
  label: 'Notes',
  name: 'notes',
  componentType: 'textarea',
  placeholder: 'Enter any special instructions or notes',
}
]
