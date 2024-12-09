import { Card, CardContent, CardHeader, CardTitle  } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import React from 'react'

const AddressCard = ({addressInfo}) => {
  return (
   
    <Card>
<CardContent className='grid gap-4 ' >
<div className="">
    <Label>  {address?.address} </Label>
    <Label>  {address?.city} </Label>
    <Label>  {address?.zipcode} </Label>
    <Label>  {address?.phone} </Label>
    <Label>  {address?.notes} </Label>
</div>
</CardContent>
    </Card>

  )
}

export default AddressCard