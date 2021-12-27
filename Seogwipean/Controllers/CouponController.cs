using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Microsoft.Extensions.Logging;
using Seogwipean.Model.CouponViewModels;
using Seogwipean.Model.KakaoViewModels;
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

        public IActionResult Index()
        {
            CouponViewModel _result = new CouponViewModel();
            var isLogin = _session.GetString("login");

            // 로그인을 하지 않은 상태
            if(isLogin != "true") {
                return View("test");
            }
            else
            {
                // 로그인 한 상태일 경우.
                KakaoViewModel vm = new KakaoViewModel();
                vm.Search = 1; // 핸드폰 번호로 검색
                vm.Phone_number = _session.GetString("phone");
                _result = _couponService.GetCouponKakao(vm); 
                if(_result == null)
                {
                    CouponViewModel _model = new CouponViewModel();
                    var _phone = _session.GetString("phone");
                    var _id = _session.GetString("id");
                    _model.KakaoId = 0;
                    if (!string.IsNullOrEmpty(_id))
                    {
                        _model.KakaoId = int.Parse(_session.GetString("id"));
                    }
                    _model.Phone = _phone;
                    _model.Search = 1;
                    var __result = _couponService.CreateCoupon(_model);
                    _result = __result.Data;
                }
                return View("use", _result);
            }
        }

        [HttpPost]
        [Route("/KakaoLogin")]
        public IActionResult KakaoLogin(KakaoViewModel _model) 
        {
            if (!string.IsNullOrEmpty(_model.Phone_number))
            {
                _session.SetString("token", Util.Trans.token(_model.Token));
                _session.SetString("phone", _model.Phone_number);
                _session.SetString("login", "true");
                return Json("Confirmed");
            }
            return Json(null);
        }

        [HttpGet]
        public IActionResult Admin()
        {
            var db = _couponService.GetCouponDB(1);
            return View(db);
        }

        [HttpPost]
        public IActionResult AdminEdit(CouponDBViewModel vm)
        {
            var db = _couponService.UpdateCouponDB(vm);
            return Json(db);
        }



        public IActionResult UseCoupon()
        {
            var _result = _couponService.UseCoupon(long.Parse(_session.GetString("coupon")));
            return View("use", _result.Data);
        }

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
            vm.Phone = _data.Phone_number;
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
