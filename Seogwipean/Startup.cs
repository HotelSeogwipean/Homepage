using System;
using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Seogwipean.Data;
using Seogwipean.Data.Repositories;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Service;
using Seogwipean.Service.Coupon;
using Seogwipean.Service.Email;
using Seogwipean.Service.Interface;
using Seogwipean.Service.Surf;

namespace Seogwipean
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        private readonly IHostingEnvironment env;

        public Startup(IHostingEnvironment env)
        {
            this.env = env;
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            builder.AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.KnownProxies.Add(IPAddress.Parse("10.0.0.100"));
            });

            services.AddScoped<IViewRenderService, ViewRenderService>();

            services.AddSingleton<HotelSeogwipeanDbContextFactory>();

            services.AddSingleton<ISurfRepository, SurfRepository>();
            services.AddSingleton<ISurfService, SurfService>();
            services.AddSingleton<ICouponRepository, CouponRepository>();
            services.AddSingleton<ICouponService, CouponService>();
            services.AddSingleton<IEmailService, EmailService>();
            
            services.AddSingleton<IConfiguration>(Configuration);

            services.AddMvc().AddSessionStateTempDataProvider();
            services.AddDistributedMemoryCache();
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.HttpOnly = true;
            });
            
            services.AddHsts(options => {
                options.Preload = true;
                options.IncludeSubDomains = true;
                options.MaxAge = TimeSpan.FromDays(60);
                options.ExcludedHosts.Add("hotelseogwipean.com");
                options.ExcludedHosts.Add("www.hotelseogwipean.com");
            });

            /*
            services.AddHttpsRedirection(options => {
                options.RedirectStatusCode = (int)HttpStatusCode.PermanentRedirect;
                options.HttpsPort = 443;
            });
            */

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
              
            }
            app.UseExceptionHandler("/Error");
            app.UseHsts();
            app.UseMiddleware(typeof(Web.VisitorCounterMiddleware));
            // app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });
            app.UseAuthentication();
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                     name: "areaRoute",
                     template: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
