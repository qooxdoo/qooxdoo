function QxNumber(v)
{
  if (typeof v == "number")
  {
    return v;
  }
  else if (typeof v == "string")
  {
    if (v=="true"||v=="false")
    {
      return Number(Boolean(v));
    }
    else
    {
      return parseFloat(v);
    };
  }
  else if (typeof v == "boolean")
  {
    return Number(v);
  }
  else
  {
    return NaN;
  };
};