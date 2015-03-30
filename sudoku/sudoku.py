from copy import deepcopy
from time import time
import random

test_cases = (
    ('already solved',
     "974236158638591742125487936316754289742918563589362417867125394253649871491873625",
     "974236158638591742125487936316754289742918563589362417867125394253649871491873625",
     True,
     ),
    ('one unknown',
     "2564891733746159829817234565932748617128.6549468591327635147298127958634849362715",
     "256489173374615982981723456593274861712836549468591327635147298127958634849362715",
     True,
     ),
    ('naked singles',
     "3.542.81.4879.15.6.29.5637485.793.416132.8957.74.6528.2413.9.655.867.192.965124.8",
     "365427819487931526129856374852793641613248957974165283241389765538674192796512438",
     True,
     ),
    ('hidden singles',
     "..2.3...8.....8....31.2.....6..5.27..1.....5.2.4.6..31....8.6.5.......13..531.4..",
     "672435198549178362831629547368951274917243856254867931193784625486592713725316489",
     True,
     ),
    ('too few numbers',
     "..9.7...5..21..9..1...28....7...5..1..851.....5....3.......3..68........21.....87",
     "",
     False,
     ),
)

def updateRow(possb, pos, val):
    rr = pos/9
    for ov in xrange(rr*9, (rr+1)*9):
        if val in possb[ov]:
            if len(possb[ov]) == 1:
                return False
            possb[ov].remove(val)

def updateCol(possb, pos, val):
    cc = pos%9
    for ov in xrange(cc, 81, 9):
        if val in possb[ov]:
            if len(possb[ov]) == 1:
                return False
            possb[ov].remove(val)

def updateCell(possb, pos, val):
    sc = (pos/27)*27 + ((pos%9)/3)*3
    for addv in (0, 1, 2, 9, 10, 11, 18, 19, 20):
        scv = sc + addv
        if val in possb[scv]:
            if len(possb[scv]) == 1:
                return False
            possb[scv].remove(val)

def updateAll(possb, pos, val):
    if updateRow(possb, pos, val) is False:
        return False
    if updateCol(possb, pos, val) is False:
        return False
    if updateCell(possb, pos, val) is False:
        return False

    return True


def initPossibilities(possb, ins):
    for rr in xrange(9):
        for cc in xrange(9):
            pos = rr*9 + cc
            val = ins[pos]
            if val != 0:
                # update row, col and cell
                possb[pos] = set()

                # update all
                if updateAll(possb, pos, val) is False:
                    print "Failed in initializing possibilities"
                    return False
    return possb

def solveSudoku(possb, ss):
    changed = True
    while changed:
        changed = False
        for pos in xrange(81):
            if len(possb[pos]) == 1:
                changed = True
                val = possb[pos].pop()
                ss[pos] = val
                if updateAll(possb, pos, val) is False:
                    return False

    guessPos = None
    min_poss_loc = None
    min_poss = 10
    for pos in xrange(81):
        num_poss = len(possb[pos])
        if 1 < num_poss < min_poss:
            min_poss = num_poss
            min_poss_loc = pos

    if min_poss_loc is None:
        return ss
    guessPos = min_poss_loc

    ss2 = deepcopy(ss)
    guessValues = list(possb[guessPos])
    random.shuffle(guessValues)
    for guess in guessValues:
        possb2 = deepcopy(possb)
        possb2[guessPos] = set()
        ss2[guessPos] = guess
        if updateAll(possb2, guessPos, guess) is False:
            return False
        retVal = solveSudoku(possb2, ss2)
        if retVal is not False:
            return retVal
    return False


def getCell(sdk, cell):
    cs = (cell/3)*27 + (cell%3)*3
    return [sdk[cs + x] for x in (0,1,2,9,10,11,18,19,20)]

def checkSolution(outs):
    # every row
    set9 = set(xrange(1,10))
    for rr in range(9):
        assert set9 == set([outs[rr*9 + x] for x in xrange(9)])

    for cc in xrange(9):
        assert set9 == set([outs[x*9 + cc] for x in xrange(9)])

    for cell in xrange(9):
        assert set9 == set(getCell(outs, cell))

    return "Solution checks out..."


def formatSudoku(outs):
    data = [str(x) for x in outs]
    data = [' '.join(data[x*3:(x+1)*3]) for x in range(27)]
    data = ['   '.join(data[x*3:(x+1)*3]) for x in range(9)]
    data = ['\n'.join(data[x*3:(x+1)*3]) for x in range(3)]
    data = '\n\n'.join(data)
    return '\n' + data + '\n'


def stringToList(inp):
    inp = inp.replace('.', '0')
    return [int(x) for x in inp]

def listToString(inp):
    return "".join(str(x) for x in inp)

def runTests():
    times = []
    for xxx in xrange(100):
        for name, inp, outp, valid in test_cases[3:4]:
            if True:
                sudokuInput = stringToList(inp)
                possibilities = [set(range(1,10)) for x in xrange(9) for y in xrange(9)]
                possb = initPossibilities(possibilities, sudokuInput)
                if possb is False:
                    print "No possibilities found"
                    continue

                st = time()
                result = solveSudoku(possb, sudokuInput)
                et = time()

                if result is False:
                    print "\nFailed to find solution"
                    if valid is True:
                        raise "Unexpected failure"
                    else:
                        print "But it is an expected failue... rejoice"

                    continue
                else:
                    print formatSudoku(result)
                    print checkSolution(result)
                    print "Took %s seconds"%str(et-st)
                    times.append(et-st)

                if listToString(result) == outp:
                    print "Test \"%s\" passed." % name
                else:
                    print "Test \"%s\" failed." % name

    from pprint import pprint as pp
    pp(times)
    print sum(times)/len(times)
    print max(times), min(times)


runTests()
