import os
import numpy as np
import pandas as pd

#import matplotlib
#matplotlib.use('Agg')

from brainflow.board_shim import BoardShim, BrainFlowInputParams, LogLevels, BoardIds
from brainflow.data_filter import DataFilter, FilterTypes, AggOperations, NoiseTypes

board_id = BoardIds.CYTON_BOARD.value

srcdir = "./recordings"
destdir = "./app/data"

def saveJSON(filename, data):
    destfilename = os.path.join(destdir, os.path.basename(filename).removesuffix(".csv") + ".json")
    with open(destfilename, 'w') as out:
        print("[", file=out)
        # SKIP FIRST HUNDRED ROWS until values settle
        print(",".join([f"{{\"timestamp\": {row[8]}, \"data\": [{', '.join(['%f' % n for n in row[:8]])}]}}" for row in data[100:]]), file=out)
        print("]", file=out)

def deexp(value):
    return pd.to_numeric(value.lower())

def processFile(filename):
    # skiprows includes comments.
    # We skip the comments, the column names, and the first sample, which is all zeros.
    # 21 is timestamp, 1..8 are eeg channels
    #data = np.array(np.loadtxt(filename, usecols=(21,1,2,3,4,5,6,7,8), delimiter=",", comments="%", skiprows=6))
    data = pd.read_csv(filename, delimiter=",", skiprows=6, usecols=[1,2,3,4,5,6,7,8,22], converters={22: deexp}).to_numpy()
    for channel in range(0, 8):
        #DataFilter.perform_bandpass(data[channel], 250, 2.0, 50.0, 4, FilterTypes.BESSEL.value, 0)
        #DataFilter.perform_highpass(data[channel], BoardShim.get_sampling_rate(board_id), 2.0, 4,
        #                            FilterTypes.BUTTERWORTH.value, 0)
        minVal = np.min(data[:,channel])
        maxVal = np.max(data[:,channel])
        rangeVal = maxVal - minVal
        if rangeVal > 0:
            scaleVal = 1.0 / rangeVal
            data[:,channel] = (data[:,channel] - minVal) * scaleVal
        else:
            data[:,channel] = 0
        #print(data[:,channel])
    if False:
        import matplotlib.pyplot as plt
        df = pd.DataFrame(data[100:])
        plt.figure()
        df.plot()
        plt.show()
    saveJSON(filename, data)

for srcfilename in os.listdir(srcdir):
    print(srcfilename)
    processFile(os.path.join(srcdir, srcfilename))
