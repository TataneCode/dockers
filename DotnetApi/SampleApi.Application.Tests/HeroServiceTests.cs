using FluentAssertions;
using NSubstitute;
using SampleApi.Application.Exceptions;
using SampleApi.Application.Services;
using SampleApi.Domain.Models;
using SampleApi.Domain.Repositories;
using Xunit;

namespace SampleApi.Application.Tests.Services;

public sealed class HeroServiceTests
{
    [Fact]
    public async Task GetAllAsync_DelegatesToRepository()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var expectedHeroes = new List<HeroModel>
        {
            CreateHero(id: "hero-1"),
            CreateHero(id: "hero-2")
        };
        heroRepository.GetAllAsync(Arg.Any<CancellationToken>()).Returns(expectedHeroes);

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.GetAllAsync();

        result.Should().BeSameAs(expectedHeroes);
        _ = heroRepository.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsHero_WhenFound()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var expectedHero = CreateHero(id: "hero-1");
        heroRepository.GetByIdAsync("hero-1", Arg.Any<CancellationToken>()).Returns(expectedHero);

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.GetByIdAsync("hero-1");

        result.Should().Be(expectedHero);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        heroRepository.GetByIdAsync("missing-hero", Arg.Any<CancellationToken>()).Returns((HeroModel?)null);

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.GetByIdAsync("missing-hero");

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_GeneratesNewGuidAsId_NormalizesPowerIds_AndDelegatesToRepository()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(id: "original-id", powerIds: ["power-1", "power-2"]);
        powerRepository.GetMissingIdsAsync(
            Arg.Is<IReadOnlyCollection<string>>(ids => ids.SequenceEqual(new[] { "power-1", "power-2" })),
            Arg.Any<CancellationToken>())
            .Returns(Array.Empty<string>());
        heroRepository.CreateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>()).Returns(info => info.Arg<HeroModel>());

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.CreateAsync(hero);

        result.Id.Should().NotBeNullOrEmpty();
        result.Id.Should().NotBe(hero.Id);
        Guid.TryParse(result.Id, out _).Should().BeTrue();
        result.PowerIds.Should().Equal("power-1", "power-2");
        _ = heroRepository.Received(1).CreateAsync(
            Arg.Is<HeroModel>(createdHero =>
                createdHero.Id == result.Id &&
                createdHero.PowerIds.SequenceEqual(new[] { "power-1", "power-2" })),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_NormalizesPowerIds_ByRemovingDuplicates()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(powerIds: ["power-1", "power-1", "power-2"]);
        powerRepository.GetMissingIdsAsync(
            Arg.Is<IReadOnlyCollection<string>>(ids => ids.SequenceEqual(new[] { "power-1", "power-2" })),
            Arg.Any<CancellationToken>())
            .Returns(Array.Empty<string>());
        heroRepository.CreateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>()).Returns(info => info.Arg<HeroModel>());

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.CreateAsync(hero);

        result.PowerIds.Should().Equal("power-1", "power-2");
        result.PowerIds.Should().OnlyHaveUniqueItems();
        _ = heroRepository.Received(1).CreateAsync(
            Arg.Is<HeroModel>(createdHero => createdHero.PowerIds.SequenceEqual(new[] { "power-1", "power-2" })),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_NormalizesPowerIds_ByRemovingBlankOrWhitespaceEntries()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(powerIds: ["power-1", string.Empty, " ", "\t", "power-2"]);
        powerRepository.GetMissingIdsAsync(
            Arg.Is<IReadOnlyCollection<string>>(ids => ids.SequenceEqual(new[] { "power-1", "power-2" })),
            Arg.Any<CancellationToken>())
            .Returns(Array.Empty<string>());
        heroRepository.CreateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>()).Returns(info => info.Arg<HeroModel>());

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.CreateAsync(hero);

        result.PowerIds.Should().Equal("power-1", "power-2");
        result.PowerIds.Should().NotContain(id => string.IsNullOrWhiteSpace(id));
        _ = heroRepository.Received(1).CreateAsync(
            Arg.Is<HeroModel>(createdHero => createdHero.PowerIds.SequenceEqual(new[] { "power-1", "power-2" })),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_SkipsPowerValidation_WhenThereAreNoPowerIds()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(powerIds: Array.Empty<string>());
        heroRepository.CreateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>()).Returns(info => info.Arg<HeroModel>());

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.CreateAsync(hero);

        result.PowerIds.Should().BeEmpty();
        _ = powerRepository.DidNotReceive().GetMissingIdsAsync(Arg.Any<IReadOnlyCollection<string>>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_ThrowsInvalidPowerReferenceException_WhenSomePowerIdsAreMissing()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(powerIds: ["power-1", "missing-power"]);
        powerRepository.GetMissingIdsAsync(
            Arg.Is<IReadOnlyCollection<string>>(ids => ids.SequenceEqual(new[] { "power-1", "missing-power" })),
            Arg.Any<CancellationToken>())
            .Returns(new[] { "missing-power" });

        var service = new HeroService(heroRepository, powerRepository);

        Func<Task> act = () => service.CreateAsync(hero);

        var assertion = await act.Should().ThrowAsync<InvalidPowerReferenceException>();
        assertion.Which.MissingPowerIds.Should().Equal("missing-power");
        _ = heroRepository.DidNotReceive().CreateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAsync_SetsProvidedIdOnTheHeroBeforeDelegating()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(id: "original-id", powerIds: ["power-1"]);
        powerRepository.GetMissingIdsAsync(
            Arg.Is<IReadOnlyCollection<string>>(ids => ids.SequenceEqual(new[] { "power-1" })),
            Arg.Any<CancellationToken>())
            .Returns(Array.Empty<string>());
        heroRepository.UpdateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>()).Returns(info => info.Arg<HeroModel>());

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.UpdateAsync("updated-id", hero);

        result.Should().NotBeNull();
        result!.Id.Should().Be("updated-id");
        _ = heroRepository.Received(1).UpdateAsync(
            Arg.Is<HeroModel>(updatedHero => updatedHero.Id == "updated-id"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenTheHeroDoesNotExist()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(powerIds: Array.Empty<string>());
        heroRepository.UpdateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>()).Returns((HeroModel?)null);

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.UpdateAsync("missing-hero", hero);

        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_NormalizesPowerIds()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(powerIds: ["power-1", "power-1", string.Empty, "power-2", " "]);
        powerRepository.GetMissingIdsAsync(
            Arg.Is<IReadOnlyCollection<string>>(ids => ids.SequenceEqual(new[] { "power-1", "power-2" })),
            Arg.Any<CancellationToken>())
            .Returns(Array.Empty<string>());
        heroRepository.UpdateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>()).Returns(info => info.Arg<HeroModel>());

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.UpdateAsync("hero-1", hero);

        result.Should().NotBeNull();
        result!.PowerIds.Should().Equal("power-1", "power-2");
        result.PowerIds.Should().OnlyHaveUniqueItems();
        result.PowerIds.Should().NotContain(id => string.IsNullOrWhiteSpace(id));
        _ = heroRepository.Received(1).UpdateAsync(
            Arg.Is<HeroModel>(updatedHero => updatedHero.PowerIds.SequenceEqual(new[] { "power-1", "power-2" })),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAsync_ThrowsInvalidPowerReferenceException_WhenSomePowerIdsAreMissing()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        var hero = CreateHero(powerIds: ["power-1", "missing-power"]);
        powerRepository.GetMissingIdsAsync(
            Arg.Is<IReadOnlyCollection<string>>(ids => ids.SequenceEqual(new[] { "power-1", "missing-power" })),
            Arg.Any<CancellationToken>())
            .Returns(new[] { "missing-power" });

        var service = new HeroService(heroRepository, powerRepository);

        Func<Task> act = () => service.UpdateAsync("hero-1", hero);

        var assertion = await act.Should().ThrowAsync<InvalidPowerReferenceException>();
        assertion.Which.MissingPowerIds.Should().Equal("missing-power");
        _ = heroRepository.DidNotReceive().UpdateAsync(Arg.Any<HeroModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_WhenHeroWasDeleted()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        heroRepository.DeleteAsync("hero-1", Arg.Any<CancellationToken>()).Returns(true);

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.DeleteAsync("hero-1");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenHeroDidNotExist()
    {
        var heroRepository = Substitute.For<IHeroRepository>();
        var powerRepository = Substitute.For<IPowerRepository>();
        heroRepository.DeleteAsync("missing-hero", Arg.Any<CancellationToken>()).Returns(false);

        var service = new HeroService(heroRepository, powerRepository);

        var result = await service.DeleteAsync("missing-hero");

        result.Should().BeFalse();
    }

    private static HeroModel CreateHero(
        string id = "hero-1",
        string name = "Clark Kent",
        string alias = "Superman",
        string origin = "Krypton",
        IReadOnlyList<string>? powerIds = null) =>
        new(
            id,
            name,
            alias,
            origin,
            powerIds ?? new[] { "power-1" });
}
