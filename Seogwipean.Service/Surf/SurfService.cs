using Microsoft.Extensions.Logging;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Model.ResultModels;
using Seogwipean.Model.SurfViewModels;
using Seogwipean.Service.Interface;
using System;
using System.Collections.Generic;

namespace Seogwipean.Service.Surf
{
    public class SurfService : ISurfService
    {
        private readonly ILogger _logger;
        private ISurfRepository _surfRepository;

        public SurfService(ILoggerFactory loggerFactory,
            ISurfRepository surfRepository)
        {
            _surfRepository = surfRepository ?? throw new ArgumentNullException(nameof(surfRepository));
            _logger = loggerFactory.CreateLogger<SurfService>();
        }

        public Data.Models.Surf GetSurf(long Id)
        {
            _logger.LogInformation("GetSurf " + Id);
            return _surfRepository.GetSurf(Id);
        }

        public LongResult<IList<Data.Models.Surf>> GetSurfList(SurfViewModel vm)
        {
            _logger.LogInformation("GetSurfList " + vm.Id);
            return _surfRepository.GetSurfList(vm);
        }

        public LongResult<SurfViewModel> AddSurf(SurfViewModel vm)
        {
            _logger.LogInformation("AddSurf " + vm.UserName);
            return _surfRepository.AddSurf(vm);
        }

        public LongResult<SurfViewModel> UpdateSurf(SurfViewModel vm)
        {
            _logger.LogInformation("UpdateSurf " + vm.Id);
            return _surfRepository.UpdateSurf(vm);
        }
    }
}