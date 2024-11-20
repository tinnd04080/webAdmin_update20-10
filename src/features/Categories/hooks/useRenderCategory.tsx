import { BsFillPencilFill, BsFillTrashFill } from 'react-icons/bs'
import { Button as ButtonAntd, Popconfirm, Space, Tooltip } from 'antd'
import { ICategory, IRoleUser } from '~/types'
import { RootState, useAppDispatch } from '~/store/store'
import { setCategory, setOpenDrawer } from '~/store/slices'
import { useDeleteFakeMutation, useDeleteRealMutation, useRestoreCategoryMutation } from '~/store/services'

import { ColumnsType } from 'antd/es/table'
import { RedoOutlined } from '@ant-design/icons'
import { cancelDelete } from '..'
import { messageAlert } from '~/utils/messageAlert'
import { pause } from '~/utils/pause'
import { useAppSelector } from '~/store/hooks'

// export const useRenderCategory = (isDeleted?: boolean) => {
export const useRenderCategory = (categories: ICategory[], isDeleted?: boolean) => {
  const [deleteFakeCategory] = useDeleteFakeMutation()
  const [restoreCategory] = useRestoreCategoryMutation()
  const [deleteRealCategory] = useDeleteRealMutation()

  const dispatch = useAppDispatch()

  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)
  console.log(categories,'categories')
  /* staff */
  const columnsStaff: ColumnsType<ICategory> = [
    {
      title: 'id tuyến',
      dataIndex: '_id',
      key: '_id',
      width: 150,
      render: (text: any) => {
        return <div>{text.slice(0, 6)}</div>
      }
    },
    {
      title: 'Điểm khởi hành',
      dataIndex: 'startProvince',
      key: 'startProvince',
      filterSearch: true,
      filters: categories?.map((item) => ({ text: item.startDistrict, value: item._id })),
      onFilter: (value: any, record: ICategory) => record._id === value
      // render: (name: string) => <span className='capitalize'>{name}</span>,
    },
    {
      title: 'Điểm đến',
      dataIndex: 'endProvince',
      key: 'endProvince',
      filterSearch: true,
      filters: categories?.map((item) => ({ text: item.startDistrict, value: item._id })),
      onFilter: (value: any, record: ICategory) => record._id === value
      // render: (name: string) => <span className='capitalize'>{name}</span>,
    },
    {
      title: 'Chiều dài tuyến',
      dataIndex: 'distance',
      key: 'distance',
    },
    {
      title: 'giá mỗi km',
      dataIndex: 'pricePerKM',
      key: 'pricePerKM',
    },
    {
      title: 'Trạng thái tuyến',
      dataIndex: 'status',
      key: 'status',
    }
  ]

  /* admin */
  const handleDelete = async (id: string) => {
    await pause(2000)
    await deleteFakeCategory(id)
      .unwrap()
      .then(() => messageAlert('Xóa thành công', 'success'))
      .catch(() => cancelDelete())
  }

  const handleRestore = async (id: string) => {
    await pause(2000)
    await restoreCategory(id)
      .unwrap()
      .then(() => messageAlert('Khôi phục thành công', 'success'))
      .catch(() => messageAlert('Khôi phục thất bại', 'error'))
  }

  const handleDeleteReal = async (id: string) => {
    await pause(2000)
    await deleteRealCategory(id)
      .unwrap()
      .then(() => messageAlert('Xóa thành công', 'success'))
      .catch(() => messageAlert('Xóa thất bại', 'error'))
  }

  const columnsAdmin: ColumnsType<ICategory> = [
    ...columnsStaff,
    {
      // title: <span className='block text-center'>Action</span>,
      key: 'action',
      width: 200,
      // fixed: 'right',
      render: (_: string, category: ICategory) => {
        if (!isDeleted) {
          return (
            <div className='flex items-center justify-center'>
              <Space size='middle'>
                <Tooltip title='Sửa Tuyến đường'>
                  <ButtonAntd
                    size='large'
                    className='bg-primary hover:!text-white flex items-center justify-center text-white'
                    icon={<BsFillPencilFill />}
                    onClick={() => {
                      dispatch(
                        setCategory({
                          _id: category._id,
                          startProvince: category.startProvince,
                          startDistrict: category.startDistrict,
                          endProvince: category.endProvince,
                          endDistrict: category.endDistrict,
                          duration: category.duration,
                          status: category.status,
                          distance: category.distance,
                          pricePerKM: category.pricePerKM,
                        })
                      );
                      dispatch(setOpenDrawer(true))
                    }}
                  />
                </Tooltip>
                <Tooltip title='Xóa Tuyến đường'>
                  <Popconfirm
                    title='Bạn có muốn xóa Tuyến đường này?'
                    description='Bạn chắc chắn muốn xóa Tuyến đường này?'
                    okButtonProps={{ style: { backgroundColor: '#3C50E0', color: '#fff' } }}
                    // onCancel={cancelDelete}
                    onConfirm={() => handleDelete(category._id)}
                  >
                    <ButtonAntd
                      size='large'
                      className='bg-meta-1 hover:!text-white flex items-center justify-center text-white'
                      icon={<BsFillTrashFill />}
                    />
                  </Popconfirm>
                </Tooltip>
              </Space>
            </div>
          )
        } else {
          return (
            <div className='flex items-center justify-center'>
              <Space size='middle'>
                <Tooltip title='Khôi phục Tuyến đường này'>
                  <Popconfirm
                    title='Bạn muốn khôi phục lại Tuyến đường này?'
                    description='Bạn thực sự muốn khôi phục lại Tuyến đường này?'
                    onConfirm={() => handleRestore(category._id)}
                  >
                    <ButtonAntd
                      size='large'
                      className='bg-primary hover:!text-white flex items-center justify-center text-white'
                      icon={<RedoOutlined className='text-lg' />}
                    />
                  </Popconfirm>
                </Tooltip>
                <Tooltip title='Xóa vĩnh viễn Tuyến đường này'>
                  <Popconfirm
                    title='Bạn có muốn xóa VĨNH VIỄN Tuyến đường này?'
                    description='Hành động này sẽ không thể khôi phục lại!'
                    okButtonProps={{ style: { backgroundColor: '#3C50E0', color: '#fff' } }}
                    // onCancel={cancelDelete}
                    onConfirm={() => handleDeleteReal(category._id)}
                  >
                    <ButtonAntd
                      size='large'
                      className='bg-meta-1 hover:!text-white flex items-center justify-center text-white'
                      icon={<BsFillTrashFill />}
                    />
                  </Popconfirm>
                </Tooltip>
              </Space>
            </div>
          )
        }
      }
    }
  ]

  return  columnsAdmin
}

// export default memo(useRenderCategory)
