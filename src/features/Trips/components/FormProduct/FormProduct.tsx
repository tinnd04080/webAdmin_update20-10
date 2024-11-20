import { Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select, Space, message } from 'antd'
import { ICategory, IImage, IProduct, ISize, ITopping } from '~/types'
import { RootState, useAppDispatch } from '~/store/store'
import { setOpenDrawer, setProductId } from '~/store/slices'
import {
  useCreateProductMutation,
  useCreateTripsMutation,
  useEditProductMutation,
  useEditTripsMutation,
  useGetAllBusRouteQuery,
  useGetAllCategoryQuery,
  useGetAllProductsQuery,
  useGetAllSizeDefaultQuery,
  useGetAllToppingsQuery
} from '~/store/services'
import { useEffect, useState } from 'react'
import { Loading } from '~/components'
import { handleUploadImage } from '../..'
import { useAppSelector } from '~/store/hooks'
import moment from 'moment'
const { Option } = Select
const FormProduct = () => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const { openDrawer } = useAppSelector((state: RootState) => state.drawer)
  const { product } = useAppSelector((state: RootState) => state.products)
  const [infoPage, _] = useState({
    _page: 1,
    _limit: 10
  })
  const [productEdit, setProductEdit] = useState<IProduct | null>(null)
  const { productId } = useAppSelector((state) => state.products)
  const [createProduct, { isLoading: isCreateLoading }] = useCreateTripsMutation()
  const { productsList } = useAppSelector((state: RootState) => state.products)
  const [editProduct, { isLoading: isUpdating }] = useEditTripsMutation()
  const {
    data: dataProducts,
    isLoading: loadingProduct,
    isError: errorProudct
  } = useGetAllProductsQuery({
    _page: 1,
    _limit: 10,
    query: ''
  })
  const { data: dataBusRoute } = useGetAllBusRouteQuery({
    _page: 1,
    _limit: 10,
    query: ''
  })
  console.log(productEdit, 'productEdit')
  const handleSubmitForm = async (values: any) => {
    if (productId && productEdit) {
      const data = {
        ...values
      }
      try {
        const response = await editProduct({ id: productEdit._id, product: data }).unwrap()
        if (response.message === 'success') {
          message.success('Cập nhật  thành công!')
        }
        dispatch(setOpenDrawer(false))
        dispatch(setProductId(null))
        /* reset form */
        form.resetFields()
      } catch (error) {
        message.error('Có lỗi xảy ra, vui lòng thử lại sau!')
      }
      return
    }
    try {
      const response = await createProduct({ ...values }).unwrap()
      if (response.message === 'success' || response.message === 'succes') {
        message.success('Thêm  thành công!')
      }
      dispatch(setOpenDrawer(false))
      dispatch(setProductId(null))
      form.resetFields()
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại sau!')
    }
  }
  useEffect(() => {
    if (productEdit) {
      form.setFieldsValue({
        route: productEdit.route?._id,
        bus: productEdit.bus?._id,
        departureTime: productEdit?.departureTime ? moment(productEdit.departureTime) : null,
        arrivalTime: productEdit?.arrivalTime ? moment(productEdit.arrivalTime) : null
      })
    }
  }, [
    form,
    productEdit,
    productsList.route,
    productsList.arrivalTime,
    productsList.departureTime,
    productsList.seatCapacity
  ])
  useEffect(() => {
    if (productId) {
      const product = productsList?.data?.find((product) => product._id === productId)

      if (product) setProductEdit(product)
    } else {
      setProductEdit(null)
    }
  }, [productId, productsList])
  return (
    <Drawer
      title={`${productId === null ? 'Thêm' : 'Cập nhật'} Xe`}
      placement='right'
      width={850}
      destroyOnClose
      onClose={() => {
        dispatch(setOpenDrawer(false))
        dispatch(setProductId(null))
      }}
      open={product ? false : openDrawer}
      extra={
        <Space>
          <label
            htmlFor='button-submit-form'
            onClick={() => {}}
            className='bg-primary py-2 px-4 flex justify-center items-center h-[44px] text-white rounded-lg cursor-pointer'
          >
            {!isCreateLoading && <p>{productId === null ? 'Thêm' : 'Cập nhật'} </p>}
            {isCreateLoading && (
              <div className='border-t-primary animate-spin w-6 h-6 border-2 border-t-2 border-white rounded-full'></div>
            )}
          </label>
        </Space>
      }
    >
      {(isCreateLoading || isUpdating) && <Loading overlay />}
      <Form layout='vertical' autoComplete='off' form={form} onFinish={handleSubmitForm}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='bus'
              label='Xe'
              rules={[{ required: productEdit ? false : true, message: 'Xe là bắt buộc' }]}
            >
              <Select placeholder='Chọn Xe' size='large' allowClear>
                {dataProducts?.data?.map((size) => (
                  <Option value={size._id} key={size._id}>
                    <span className='text-sm capitalize'>
                      <span className='capitalize'>{size.licensePlate}</span>
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='route'
              label='Chuyến'
              rules={[{ required: productEdit ? false : true, message: 'Chuyến là bắt buộc' }]}
            >
              <Select placeholder='Chọn Chuyến' size='large' allowClear>
                {dataBusRoute?.data?.map((size) => (
                  <Option value={size._id} key={size._id}>
                    <span className='text-sm capitalize'>
                      <span className='capitalize'>
                        {size.startProvince} - {size.endProvince}
                      </span>
                    </span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='departureTime'
              label='Giờ khởi hành'
              rules={[{ required: true, message: 'Giờ khởi hành là bắt buộc' }]}
            >
              <DatePicker showTime format='YYYY-MM-DD HH:mm:ss' className='w-full' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='arrivalTime' label='Giờ đến' rules={[{ required: true, message: 'Giờ đến là bắt buộc' }]}>
              <DatePicker showTime format='YYYY-MM-DD HH:mm:ss' className='w-full' />
            </Form.Item>
          </Col>
        </Row>
        <input type='submit' id='button-submit-form' value={'gửi'} className='hidden' />
      </Form>
    </Drawer>
  )
}
export default FormProduct
