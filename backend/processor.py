import sys
class IntervalCalendar:
    def __init__(self):
        self.intervals=[]
    def addAvailable(self,s,e):
        if s>=e:
            return
        newL=s
        newR=e
        new_intervals=[]
        inserted=False
        for L,R in self.intervals:
            if R<newL:
                new_intervals.append([L,R])
            elif newR<L:
                if not inserted:
                    new_intervals.append([newL,newR])
                    inserted=True
                new_intervals.append([L,R])
            else:
                newL=min(newL,L)
                newR=max(newR,R)
        if not inserted:
            new_intervals.append([newL,newR])
        self.intervals=new_intervals
    def isAvailable(self,s,e):
        if s>=e:
            return False
        for L,R in self.intervals:
            if L<=s and R>=e:
                return True
            if L>s:
                break
        return False
    def reserve(self,s,e):
        if s>=e:
            return False
        new_intervals=[]
        ok=False
        for L,R in self.intervals:
            if not ok and L<=s and R>=e:
                ok=True
                if L<s:
                    new_intervals.append([L,s])
                if e<R:
                    new_intervals.append([e,R])
            else:
                new_intervals.append([L,R])
        self.intervals=new_intervals
        return ok
    def print(self):
        sys.stdout.write("Current available intervals:\n")
        for L,R in self.intervals:
            sys.stdout.write("[" + str(L) + ", " + str(R) + ")\n")
        sys.stdout.write("--------------\n")
class Option:
    def __init__(self):
        self.id = 0
        self.host_id=0
        self.address=""
        self.price=0.0
        self.lat = 0.0
        self.lng = 0.0
        self.cal=IntervalCalendar()