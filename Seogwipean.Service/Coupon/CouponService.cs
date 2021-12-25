using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Model.CouponViewModels;
using Seogwipean.Model.KakaoViewModels;
using Seogwipean.Model.ResultModels;
using Seogwipean.Service.Interface;
using Seogwipean.Util;
using System;
using System.Collections.Generic;

namespace Seogwipean.Service.Coupon
{
    public class CouponService : ICouponService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger; 
        private ISession _session => _httpContextAccessor.HttpContext.Session;
        private ICouponRepository _couponRepository;

        public CouponService(ILoggerFactory loggerFactory,
            ICouponRepository couponRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _couponRepository = couponRepository ?? throw new ArgumentNullException(nameof(couponRepository));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = loggerFactory.CreateLogger<CouponService>();
        }


        public bool IsLoggedIn()
        {
            var _log = _session.GetString("token");
            if (_log == "null" || _log == null)
            {
                return false;
            }
            return true;
        }
        

        public Data.Models.Coupon GetCoupon(long Id) {
            _logger.LogInformation("GetCoupon " + Id);
            return _couponRepository.GetCoupon(Id);
        }

        public CouponViewModel GetCouponKakao(KakaoViewModel vm)
        {
            _logger.LogInformation("GetCouponKakao " + vm.Phone_number);
            return _couponRepository.GetCouponKakao(vm);
        }

        public CouponViewModel GetCouponModel(long Id)
        {
            _logger.LogInformation("GetCouponModel " + Id);
            return _couponRepository.GetCouponModel(Id);
        }

        public LongResult<IList<Data.Models.Coupon>> GetCouponList(CouponViewModel vm)
        {
            _logger.LogInformation("GetCouponList " + vm.CouponId);
            return _couponRepository.GetCouponList(vm);
        }

        public LongResult<CouponViewModel> CreateCoupon(CouponViewModel vm)
        {
            _logger.LogInformation("CreateCoupon " + vm.CouponId);
            return _couponRepository.CreateCoupon(vm);
        }

        public LongResult<CouponViewModel> UseCoupon(long couponId)
        {
            _logger.LogInformation("UseCoupon " + couponId);
            return _couponRepository.UseCoupon(couponId);
        }


        public Data.Models.CouponDb GetCouponDB(long Id)
        {
            _logger.LogInformation("GetCouponDB " + Id);
            return _couponRepository.GetCouponDB(Id);
        }
        
        public Data.Models.CouponDb UpdateCouponDB(CouponDBViewModel vm)
        {
            _logger.LogInformation("UpdateCouponDB " + vm.Id);
            return _couponRepository.UpdateCouponDB(vm);
        }
    }
}