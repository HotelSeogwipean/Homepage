using Microsoft.Extensions.Logging;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Model.CouponViewModels;
using Seogwipean.Model.ResultModels;
using Seogwipean.Model.SurfViewModels;
using Seogwipean.Service.Interface;
using System;
using System.Collections.Generic;

namespace Seogwipean.Service.Coupon
{
    public class CouponService : ICouponService
    {
        private readonly ILogger _logger;
        private ICouponRepository _couponRepository;

        public CouponService(ILoggerFactory loggerFactory,
            ICouponRepository surfRepository)
        {
            _couponRepository = surfRepository ?? throw new ArgumentNullException(nameof(surfRepository));
            _logger = loggerFactory.CreateLogger<CouponService>();
        }


        public Data.Models.Coupon GetCoupon(long Id) {
            _logger.LogInformation("GetCoupon " + Id);
            return _couponRepository.GetCoupon(Id);
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

    }
}