export const registerFormControl = [
    {
        name: 'userName', 
        label: 'Username',
        placeholder: 'Enter your username',
        componentType: 'input',
        type: 'text',
    },
    {
        name: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        componentType: 'input',
        type: 'email',
    },
    {
        name: 'password',
        label: 'Password',
        placeholder: 'Enter your password',
        componentType: 'input',
        type: 'password',
    },
]
export const loginFormControl = [
    {
        name: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        componentType: 'input',
        type: 'email',
    },
    {
        name: 'password',
        label: 'Password',
        placeholder: 'Enter your password',
        componentType: 'input',
        type: 'password',
    },
]

export const addProductsFormElements = [
    {
        label: 'Title',
        name: 'title',
        componentType: 'input',
        type: 'text',
        placeholder: 'Enter product title',
    },
    {
        label: 'Description',
        name: 'description',
        componentType: 'textarea',
        placeholder: 'Enter product description',
    },
    {
        label: 'Category',
        name: 'category',
        componentType: 'select',
        options:[
            {id: 'men', label: 'Men' },
            {id: 'women', label: 'Women' },
            {id: 'kids', label: 'Kids' },
            {id: 'accessories', label: 'Accessories' },
            {id: 'footwear', label: 'Footwear' },

        ]
    },
    {
        label: 'Brand',
        name: 'brand',
        componentType: 'select',
        options:[
            {id: 'nike', label: 'Men' },
            {id: 'adidas', label: 'Women' },
            {id: 'puma', label: 'Kids' },
            {id: 'timberland', label: 'Accessories' },
            {id: 'vans', label: 'Footwear' },
            {id: 'converse ', label: 'Converse ' },
            {id: 'new balance', label: 'New Balance' },
            {id: 'formal ', label: 'Formal ' },

        ]
    },
    {
        label: 'Price',
        name: 'price',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter product price',
    },
    {
        label: 'Sale Price',
        name: 'salePrice',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter product sale price (optional)',
    },
    {
        label: 'Total Stock ',
        name: 'totalStock',
        componentType: 'input',
        type: 'number',
        placeholder: 'Enter total stock',
    },
]