using Seogwipean.Model.CouponViewModels;
using Seogwipean.Model.ResultModels;
using System.Collections.Generic;

namespace Seogwipean.Service.Interface
{
    public interface ICouponService
    {
        Data.Models.Coupon GetCoupon(long Id);
        CouponViewModel GetCouponModel(long Id);
        LongResult<IList<Data.Models.Coupon>> GetCouponList(CouponViewModel vm);
        LongResult<CouponViewModel> CreateCoupon(CouponViewModel vm);
        LongResult<CouponViewModel> UseCoupon(long couponId);
    }
}
