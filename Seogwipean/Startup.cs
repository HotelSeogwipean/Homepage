using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Seogwipean.Data;
using Seogwipean.Data.Repositories;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Service;
using Seogwipean.Service.Booking;
using Seogwipean.Service.Community;
using Seogwipean.Service.Email;
using Seogwipean.Service.Interface;

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
            services.AddScoped<IViewRenderService, ViewRenderService>();

            services.AddSingleton<HotelSeogwipeanDbContextFactory>();

            services.AddSingleton<IBookingRepository, BookingRepository>();
            services.AddSingleton<ICommunityRepository, CommunityRepository>();

            services.AddSingleton<IBookingService, BookingService>();
            services.AddSingleton<IEmailService, EmailService>();
            services.AddSingleton<ICommunityService, CommunityService>();

            services.AddSingleton<IConfiguration>(Configuration);


            services.AddMvc().AddSessionStateTempDataProvider();
            services.AddDistributedMemoryCache();
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.HttpOnly = true;
            });
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
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseMiddleware(typeof(Web.VisitorCounterMiddleware));
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
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
