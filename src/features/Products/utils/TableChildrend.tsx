import { Table } from 'antd'
import { IToppingRefProduct } from '~/types'
import { formatCurrency } from '~/utils'

export default function TableChildrend({ products, totalPrice, itm }: any) {
  console.log(products, 'products')
  const kindOfRoom = products
  const columns = [
    {
      title: 'Tên Xe',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',

      render: (image: any) => (
        <img src={image} className='object-cover w-20 h-20 rounded-lg cursor-pointer mb-1' alt='' />
      )
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',

      render: (price: number) => formatCurrency(price)
    },
    {
      title: 'Giờ chạy',
      dataIndex: 'topping',
      key: 'topping',
      render: (topping: any) => {
        console.log(topping, 'topping')
        return (
          <p>
            {topping?.[0]?.name} giờ - {formatCurrency(topping?.[0]?.price)}
          </p>
        )
      }
    },
    {
      title: 'Loại ghế',
      dataIndex: 'kindOfRoom',
      key: 'kindOfRoom',
      render: (kindOfRoom: any) => {
        return (
          <p>
            {kindOfRoom?.[0]?.name} - {formatCurrency(kindOfRoom?.[0]?.price)}
          </p>
        )
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => formatCurrency(totalPrice)
    },
    {
      dataIndex: 'action',
      key: 'action',
      width: 200
    }
  ]
  const dataPush = products?.map((item: any) => ({
    name: item.name,
    quantity: item.quantity,
    size: item.size,
    topping: item.toppings,
    price: item.price,
    image: item.image,
    kindOfRoom: item.kindOfRoom
  }))
  return <Table className='my-3' bordered columns={columns} dataSource={dataPush} pagination={false} />
}
