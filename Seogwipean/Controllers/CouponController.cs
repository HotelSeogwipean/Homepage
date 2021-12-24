using System;
using Microsoft.AspNetCore.Http;
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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private ISession _session => _httpContextAccessor.HttpContext.Session;

        public CouponController(ILoggerFactory loggerFactory,
                                ICouponService couponService,
                                IKakaoService kakaoService,
                                IHttpContextAccessor httpContextAccessor)
        {
            _couponService = couponService ?? throw new ArgumentNullException(nameof(couponService));
            _kakaoService = kakaoService ?? throw new ArgumentNullException(nameof(kakaoService));
            _httpContextAccessor = httpContextAccessor;
            _logger = loggerFactory.CreateLogger<CouponController>();
        }

        // 
        public IActionResult Index()
        {
            CouponViewModel _result = new CouponViewModel();
            var isLogin = _couponService.IsLoggedIn();
            if (isLogin)
            {
                _result = _couponService.GetCouponKakao(long.Parse(_session.GetString("id"))); 
                return View("use", _result);
            }
            else
            {
                return View("test");
            }
        }

        public IActionResult Idx()
        {
            return View();
        }

        public IActionResult Test()
        {
            return View();
        }

        [HttpGet][HttpPost]
        public IActionResult IsLoggedIn()
        {
            var _result = _couponService.IsLoggedIn();
            return Json(_result);
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
            var _data = _kakaoService.GetProfileSave();
            vm.KakaoId = _data.Id;
            vm.Phone = _data.Kakao_account.Phone_number;
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
        public RedirectResult Login(string url)
        {
            var _url = Request.HttpContext.Request.Host;
            return Redirect(_kakaoService.Login(_url.ToString()));
        }

        [Route("/Kakao/login-callback")]
        public RedirectResult LoginCallback(String code)
        {
            var _url = Request.HttpContext.Request.Host;
            return Redirect(_kakaoService.LoginCallback(_url.ToString(), code));
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
