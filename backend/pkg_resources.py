import importlib.metadata as _meta


class DistributionNotFound(Exception):
    pass


class _Dist:
    def __init__(self, version):
        self.version = version


def get_distribution(name: str):
    try:
        ver = _meta.version(name)
        return _Dist(ver)
    except Exception:
        raise DistributionNotFound(name)
