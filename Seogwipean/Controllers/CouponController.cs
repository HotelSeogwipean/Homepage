using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.CouponViewModels;
using Seogwipean.Model.ResultModels;
using Seogwipean.Service.Interface;

namespace Seogwipean.Web.Controllers
{
    public class CouponController : BaseController
    {
        private readonly ILogger _logger;
        private readonly ICouponService _couponService;

        public CouponController(ILoggerFactory loggerFactory,
                                ICouponService couponService)
        {
            _couponService = couponService ?? throw new ArgumentNullException(nameof(couponService));
            _logger = loggerFactory.CreateLogger<BookingController>();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult GetCoupon(long id)
        {
            var coupon = _couponService.GetCoupon(id);
            return Json(coupon);
        }
        [HttpPost]
        public IActionResult GetCouponModel(long id)
        {
            var coupon = _couponService.GetCouponModel(id);
            return Json(coupon);
        }
        [HttpPost]
        public IActionResult GetCouponList(CouponViewModel vm)
        {
            var coupon = _couponService.GetCouponList(vm);
            return Json(coupon);
        }
        [HttpPost]
        public IActionResult CreateCoupon(CouponViewModel vm)
        {
            var coupon = _couponService.CreateCoupon(vm);
            return Json(coupon);
        }
        [HttpPost]
        public IActionResult UseCoupon(long couponId)
        {
            var coupon = _couponService.UseCoupon(couponId);
            return Json(coupon);
        }

    }
}