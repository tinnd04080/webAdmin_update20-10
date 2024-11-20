import './style.module.css'

import {
  Drawer,
  Space,
  Table,
  Tooltip,
  Button as ButtonAntd,
  Popconfirm,
  Form,
  message,
  Row,
  Col,
  Input,
  InputNumber,
  Button,
  Select
} from 'antd'
import { RootState, useAppDispatch } from '~/store/store'
import { setOpenDrawer, setProductDetail } from '~/store/slices'

import { BiSolidDiscount } from 'react-icons/bi'
import { formatCurrency } from '~/utils'
import parse from 'html-react-parser'
import { useAppSelector } from '~/store/hooks'
import { v4 as uuidv4 } from 'uuid'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { AiFillEdit } from 'react-icons/ai'
import { MinusCircleOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons'

const PreviewProduct = () => {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm()

  const { openDrawer } = useAppSelector((state: RootState) => state.drawer)
  const { product } = useAppSelector((state: RootState) => state.products)
  const [seat, setSeat] = useState([])
  const [checkCreate, setCheckCreate] = useState(false)
  const [checkEdit, setCheckEdit] = useState(false)
  const [dataDetail, setDataDetail] = useState<any>(null)

  const accessToken = localStorage.getItem('token')
  const fetchSeat = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/seats?bus=${product?._id}&page=1`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      setSeat(data?.data)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    fetchSeat()
  }, [product?._id, accessToken])
  console.log(dataDetail, 'dataDetaildataDetaildataDetaildataDetail')
  useEffect(() => {
    if (checkEdit) {
      form.setFieldsValue({
        seatNumber: dataDetail?.seatNumber,
        status: dataDetail?.status
      })
    }
  }, [form, checkEdit, dataDetail?.seatNumber, dataDetail?.status])

  const columns = [
    {
      dataIndex: 'seatNumber',
      key: 'seatNumber',
      render: (name: string) => <span className='max-w-[200px] capitalize'>{name}</span>
    },
    {
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (price: number) => <span className='max-w-[200px]'>{formatCurrency(price)}</span>
    },
    {
      // title: 'Action',
      dataIndex: 'action',
      width: 100,
      key: 'action',
      render: (_: any, product: any) => {
        return (
          <Space>
            <Tooltip title='Cập nhật Xe'>
              <ButtonAntd
                size='large'
                icon={<AiFillEdit />}
                onClick={() => {
                  setCheckCreate(true)
                  setCheckEdit(true)
                  setDataDetail(product)
                }}
                className='bg-primary hover:text-white flex items-center justify-center text-white'
              />
            </Tooltip>
            <Popconfirm
              title='Xóa Xe?'
              description={`Xe sẽ bị xóa'`}
              onConfirm={async () => {
                try {
                  const { data } = await axios.delete(`${import.meta.env.VITE_API}/seats/${product?._id}`, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`
                    }
                  })
                  fetchSeat()
                } catch (error) {
                  //
                }
              }}
              okText='Có'
              cancelText='Không'
            >
              <ButtonAntd
                size='large'
                icon={<SyncOutlined />}
                danger
                className='hover:text-white flex items-center justify-center text-white'
              />
            </Popconfirm>
          </Space>
        )
      }
    }
  ]
  const handleSubmitForm = async (values: any) => {
    console.log(values, 'cccc')
    const seats = values.size.map((seat: any) => ({
      seatNumber: seat.name,
      status: 'EMPTY'
    }))
    const dataPayload = {
      bus: product?._id,
      seats: seats
    }
    try {
      const resData = await axios.post(`${import.meta.env.VITE_API}/seats`, dataPayload, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      message.success('Thêm Xe thành công!')
      fetchSeat()
      form.resetFields()
      setCheckCreate(!checkCreate)
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại sau!')
    }
  }
  const handleSubmitFormV2 = async (values: any) => {
    const dataPayload = {
      bus: product?._id,
      seatNumber: values?.seatNumber,
      status: values?.status
    }
    try {
      const resData = await axios.put(`${import.meta.env.VITE_API}/seats/${dataDetail._id}`, dataPayload, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      message.success('sửa ghế thành công!')
      fetchSeat()
      form.resetFields()
      setCheckCreate(!checkCreate)
      setCheckEdit(!checkEdit)
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại sau!')
    }
  }
  if (!product) return null

  return (
    <Drawer
      title='Xem chi tiết '
      placement='right'
      open={product ? openDrawer : false}
      width={800}
      onClose={() => {
        dispatch(setOpenDrawer(false)), dispatch(setProductDetail(null))
      }}
    >
      <div>
        <ButtonAntd
          onClick={() => {
            setCheckCreate(!checkCreate)
            setCheckEdit(false)
          }}
          className='bg-success text-white font-medium mb-5'
        >
          {checkCreate ? 'Quay lại' : 'Thêm ghế mới'}
        </ButtonAntd>
        {checkCreate ? (
          <>
            {checkEdit ? (
              <Form layout='vertical' autoComplete='off' form={form} onFinish={handleSubmitFormV2}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item name='seatNumber' label='Tên ghế'>
                      <Input placeholder='Tên ghế' className='w-full' />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item name='status'>
                      <Select
                        onChange={(value) => {
                          // console.log(order, 'value')
                          // onConfirmOrder({
                          //   idOrder: order.key,
                          //   idUser: value
                          // })
                        }}
                        placeholder='Trạng thái'
                        size='large'
                      >
                        <Select.Option value={'EMPTY'}>
                          <span className='text-sm capitalize'>EMPTY</span>
                        </Select.Option>
                        <Select.Option value={'SOLD'}>
                          <span className='text-sm capitalize'>SOLD</span>
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type='primary' htmlType='submit' size='large'>
                    Submit
                  </Button>
                </Form.Item>
                <input type='submit' id='button-submit-form' value={'gửi'} className='hidden' />
              </Form>
            ) : (
              <Form layout='vertical' autoComplete='off' form={form} onFinish={handleSubmitForm}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item className='w-full' label='Ghế Xe'>
                      <Form.List name='size'>
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...restField }) => (
                              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'name']}
                                  rules={[{ required: true, message: 'Tên Ghế là bắt buộc' }]}
                                >
                                  <Input size='large' placeholder='tên Ghế' />
                                </Form.Item>
                                {/* <Form.Item
                                {...restField}
                                name={[name, 'price']}
                                rules={[{ required: true, message: 'Giá Ghế là bắt buộc' }]}
                              >
                                <InputNumber size='large' placeholder='Giá Ghế của Xe' className='w-full' />
                              </Form.Item> */}
                                <MinusCircleOutlined onClick={() => remove(name)} />
                              </Space>
                            ))}
                            <Form.Item>
                              <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />} size='large'>
                                Thêm trường Ghế
                              </Button>
                            </Form.Item>
                            <Form.Item>
                              <Button type='primary' htmlType='submit' size='large'>
                                Submit
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Form.Item>
                  </Col>
                </Row>
                <input type='submit' id='button-submit-form' value={'gửi'} className='hidden' />
              </Form>
            )}
          </>
        ) : (
          <div className='flex flex-col gap-5'>
            <div className='relative flex flex-col gap-3'>
              <div className=''>
                <h2 className='text-lg font-semibold'>Ghế</h2>
              </div>
              <Table
                dataSource={seat?.map((item: any) => ({ ...item, key: uuidv4() }))}
                columns={columns}
                pagination={false}
              />
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default PreviewProduct
