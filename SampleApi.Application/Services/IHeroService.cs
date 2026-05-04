using SampleApi.Domain.Models;

namespace SampleApi.Application.Services;

public interface IHeroService
{
    Task<IReadOnlyList<HeroModel>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<HeroModel?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<HeroModel> CreateAsync(HeroModel hero, CancellationToken cancellationToken = default);
    Task<HeroModel?> UpdateAsync(string id, HeroModel hero, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
