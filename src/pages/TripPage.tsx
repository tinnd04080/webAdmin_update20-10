import { FeatureProducts } from '~/features'
import { useGetAllProductsQuery, useGetAllTripsQuery } from '~/store/services'
import NotFound from './NotFound'
import FeatureTrips from '~/features/Trips'

const TripPage = () => {
  /* lấy ra tất cả các sản phẩm */
  const {
    data: dataProducts,
    isLoading: loadingProduct,
    isError: errorProudct
  } = useGetAllTripsQuery({
    _page: 1,
    _limit: 10,
    query: ''
  })
  if (loadingProduct) {
    return <div>Loading...</div>
  }
  if (errorProudct || !dataProducts) {
    return <NotFound />
  }
  console.log(dataProducts,'dataProducts')
  return (
    <div>
      <FeatureTrips data={dataProducts} />
    </div>
  )
}

export default TripPage
