using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.CouponViewModels;
using Seogwipean.Service.Interface;

namespace Seogwipean.Web.Controllers
{
    public class CouponController : BaseController
    {
        private readonly ILogger _logger;
        private readonly ICouponService _couponService;
        private readonly IKakaoService _kakaoService;
        
        public CouponController(ILoggerFactory loggerFactory,
                                ICouponService couponService,
                                IKakaoService kakaoService)
        {
            _couponService = couponService ?? throw new ArgumentNullException(nameof(couponService));
            _kakaoService = kakaoService ?? throw new ArgumentNullException(nameof(kakaoService));
            _logger = loggerFactory.CreateLogger<CouponController>();
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Idx()
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

        [Route("/Kakao/login")]
        public RedirectResult Login()
        {
            return Redirect(_kakaoService.Login());
        }

        [Route("/Kakao/login-callback")]
        public RedirectResult LoginCallback(String code)
        {
            return Redirect(_kakaoService.LoginCallback(code));
        }

        [Route("/Kakao/profile")]
        public String GetProfile()
        {
            return _kakaoService.GetProfile();
        }

        [Route("/Kakao/authorize")]
        public RedirectResult Authorize(String scope)
        {
            return Redirect(_kakaoService.Login(scope));
        }

        [Route("/Kakao/friends")]
        public String GetFriends()
        {
            return _kakaoService.GetFriends();
        }

        [Route("/Kakao/message")]
        public String Message()
        {
            return _kakaoService.Message();
        }
    }
}