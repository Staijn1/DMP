import pandas as pd
from datetime import datetime
import matplotlib.pyplot as plt
from IPython.display import display
import arcgis.gis as gis
from arcgis.gis import GIS
from arcgis.features.analyze_patterns import calculate_density, find_hot_spots
from arcgis.mapping.symbol import create_symbol
from arcgis.features.use_proximity import create_drive_time_areas
from arcgis.features.summarize_data import summarize_within


def execute_analysis():
    gis = GIS()

    # Search for Verkeersongevallen in the Netherlands
    ong = gis.content.search("title:Verkeersongevallen Utrecht", "Feature *")

    display(ong)

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    execute_analysis()

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
