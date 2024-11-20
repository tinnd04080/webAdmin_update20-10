import { Drawer, Form, Input, DatePicker, message } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { RootState, useAppDispatch } from '~/store/store'
import { setCategory, setOpenDrawer } from '~/store/slices'
import { Button } from '~/components'
import { useAppSelector } from '~/store/hooks'
import { useAddCategoryMutation, useUpdateCategoryMutation } from '~/store/services'
import { messageAlert } from '~/utils/messageAlert'
import moment from 'moment'
import { useEffect } from 'react'

type FormCategoryProps = {
  open: boolean
}

const FormCategory = ({ open }: FormCategoryProps) => {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm()
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()
  const { cateData } = useAppSelector((state: RootState) => state.categories)
console.log(cateData,'cateData')
  useEffect(() => {
    if (cateData._id) {
      form.setFieldsValue({
        ...cateData,
        duration: cateData?.duration ? moment(cateData.duration) : undefined // Chuyển đổi sang Moment object
      })
    }
  }, [cateData])

  const onFinish = async (values: any) => {
    console.log(values,'ccc')
    const formattedValues = {
      ...values,
      duration: values.duration ? values.duration.toISOString() : null // Chuyển đổi thành ISO string
    }

    if (cateData._id) {
      updateCategory({ _id: cateData._id, ...formattedValues })
        .unwrap()
        .then(() => {
          messageAlert('Cập nhật Tuyến đường thành công', 'success')
          onClose()
        })
        .catch(() => messageAlert('Cập nhật Tuyến đường thất bại', 'error'))
      return
    }

    addCategory(formattedValues)
      .unwrap()
      .then(() => {
        message.success('Thêm Tuyến đường thành công')
        dispatch(setOpenDrawer(false))
        form.resetFields()
      })
      .catch(() => message.error('Thêm Tuyến đường thất bại'))
  }

  const onClose = () => {
    dispatch(setOpenDrawer(false))
    dispatch(setCategory({}))
    form.resetFields()
  }
  return (
    <Drawer
      title={cateData._id ? 'Cập nhật Tuyến đường' : 'Thêm Tuyến đường mới'}
      width={376}
      destroyOnClose
      onClose={onClose}
      getContainer={false}
      open={open}
    >
      <Form
        name='basic'
        autoComplete='off'
        layout='vertical'
        form={form}
        className='dark:text-white'
        onFinish={onFinish}
      >
        <Form.Item
          label='Tỉnh/Thành phố xuất phát'
          name='startProvince'
          rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố xuất phát!' }]}
        >
          <Input size='large' placeholder='Tỉnh/Thành phố xuất phát' />
        </Form.Item>

        <Form.Item
          label='Điểm xuất phát'
          name='startDistrict'
          rules={[{ required: true, message: 'Vui lòng nhập điểm xuất phát!' }]}
        >
          <Input size='large' placeholder='Điểm xuất phát' />
        </Form.Item>

        <Form.Item
          label='Tỉnh/Thành phố đến'
          name='endProvince'
          rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố đến!' }]}
        >
          <Input size='large' placeholder='Tỉnh/Thành phố đến' />
        </Form.Item>

        <Form.Item label='Điểm đến' name='endDistrict' rules={[{ required: true, message: 'Vui lòng nhập điểm đến!' }]}>
          <Input size='large' placeholder='Điểm đến' />
        </Form.Item>

        <Form.Item label='Ngày' name='duration' rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
          <DatePicker size='large' style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label='Trạng thái' name='status' rules={[{ required: true, message: 'Vui lòng nhập trạng thái!' }]}>
          <Input size='large' placeholder='Trạng thái (OPEN/CLOSED)' />
        </Form.Item>

        <Form.Item
          label='Khoảng cách (km)'
          name='distance'
          rules={[{ required: true, message: 'Vui lòng nhập khoảng cách!' }]}
        >
          <Input size='large' placeholder='Khoảng cách (km)' />
        </Form.Item>

        <Form.Item
          label='Giá mỗi km'
          name='pricePerKM'
          rules={[{ required: true, message: 'Vui lòng nhập giá mỗi km!' }]}
        >
          <Input size='large' placeholder='Giá mỗi km (VND)' />
        </Form.Item>

        <Form.Item>
          <Button
            disabled={isAdding || isUpdating}
            icon={isAdding || isUpdating ? <LoadingOutlined /> : undefined}
            styleClass='!w-full mt-5 py-2'
            type='submit'
          >
            {cateData._id ? 'Cập nhật Tuyến đường' : 'Thêm Tuyến đường'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default FormCategory
