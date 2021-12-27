using Seogwipean.Model.CouponViewModels;
using Seogwipean.Model.KakaoViewModels;
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
        LongResult<CouponViewModel> UseCoupon(string phone);
        bool IsLoggedIn();
        CouponViewModel GetCouponKakao(KakaoViewModel vm);

        Data.Models.CouponDb GetCouponDB(long Id);
        Data.Models.CouponDb UpdateCouponDB(CouponDBViewModel vm);
    }
}
