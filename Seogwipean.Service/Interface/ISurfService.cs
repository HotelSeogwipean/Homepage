using Seogwipean.Model.ResultModels;
using Seogwipean.Model.SurfViewModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Service.Interface
{
    public interface ISurfService
    {
        Data.Models.Surf GetSurf(long Id);

        LongResult<IList<Data.Models.Surf>> GetSurfList(SurfViewModel vm);

        LongResult<SurfViewModel> AddSurf(SurfViewModel vm);

        LongResult<SurfViewModel> UpdateSurf(SurfViewModel vm);
    }
}
