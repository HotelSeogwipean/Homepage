using Seogwipean.Data.Models;
using Seogwipean.Model.CouponViewModels;
using Seogwipean.Model.ResultModels;
using Seogwipean.Model.SurfViewModels;
using System.Collections.Generic;

namespace Seogwipean.Data.Repositories.Interface
{
    public interface ICouponRepository
    {
        Coupon GetCoupon(long Id);
        CouponViewModel GetCouponModel(long Id);
        LongResult<IList<Coupon>> GetCouponList(CouponViewModel vm);

    }
}
