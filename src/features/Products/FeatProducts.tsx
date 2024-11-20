import { Breadcrumb, Button, PlusIcon } from '~/components'
import { FormProduct, PreviewProduct, ProductListActive } from './components'
import { IProduct, IRoleUser } from '~/types'
import { RootState, useAppDispatch } from '~/store/store'

import { Tabs } from 'antd'
import { items } from './data/data'
import { setOpenDrawer } from '~/store/slices'
import { setProductsList } from '~/store/slices/Products/product.slice'
import { useAppSelector } from '~/store/hooks'
import { useEffect, useState } from 'react'

interface FeatureProductsProps {
  data: IProduct[]
}

const FeatureProducts = ({ data }: FeatureProductsProps) => {
  const dispatch = useAppDispatch()
  const [checkPath, setCheckPath] = useState(false)
  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)
  const pathname = window.location.pathname
  useEffect(() => {
    dispatch(setProductsList(data))
  }, [dispatch, data])
  useEffect(() => {
    if (pathname.includes('/bg')) {
      console.log(checkPath, 'checkPath')
      setCheckPath(true)
    } else {
      setCheckPath(false)
    }
  }, [pathname])
  const isAdmin = user && user.role === IRoleUser.ADMIN

  return (
    <div>
      <Breadcrumb pageName={checkPath ? 'Bảng giá' : 'Xe'}>
        {/* {isAdmin && !checkPath && (
          <Button icon={<PlusIcon />} onClick={() => dispatch(setOpenDrawer(true))}>
            Thêm
          </Button>
        )} */}
          <Button icon={<PlusIcon />} onClick={() => dispatch(setOpenDrawer(true))}>
            Thêm
          </Button>
      </Breadcrumb>
      <FormProduct />
      {isAdmin && !checkPath ? (
        <>
          <Tabs defaultActiveKey='1' items={items} />
          <FormProduct />
        </>
      ) : (
        
        <ProductListActive checkPath={checkPath}/>
      )}

      {/* preview product */}
      <PreviewProduct />
    </div>
  )
}

export default FeatureProducts
